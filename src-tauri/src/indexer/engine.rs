//! Background indexing engine.

use std::sync::{Arc, Mutex};
use std::path::Path;
use rusqlite::Connection;
use tauri::{AppHandle, Emitter, Manager};
use serde::Serialize;
use uuid::Uuid;
use walkdir::WalkDir;

use crate::indexer::metadata::{extract_metadata, is_supported_extension, media_type_from_extension};
use crate::indexer::hasher::compute_fingerprint;

pub type CancelFlag = Arc<Mutex<bool>>;

#[derive(Debug, Serialize, Clone)]
pub struct IndexingProgressEvent {
    pub job_id: String,
    pub drive_id: String,
    pub files_found: u64,
    pub files_indexed: u64,
    pub files_skipped: u64,
    pub percent_complete: u8,
}

#[derive(Debug, Serialize, Clone)]
pub struct IndexingCompleteEvent {
    pub job_id: String,
    pub drive_id: String,
    pub total_indexed: u64,
    pub total_skipped: u64,
    pub duration_ms: u64,
}

/// Start a background indexing job. Returns job_id immediately.
pub fn start_indexing(
    app_handle: AppHandle,
    db: Arc<Mutex<Connection>>,
    drive_id: String,
    root_path: String,
    incremental: bool,
    cancel_flag: CancelFlag,
) -> String {
    let job_id = Uuid::new_v4().to_string();
    let job_id_clone = job_id.clone();

    std::thread::spawn(move || {
        run_indexing_job(app_handle, db, job_id_clone, drive_id, root_path, incremental, cancel_flag);
    });

    job_id
}

fn run_indexing_job(
    app_handle: AppHandle,
    db: Arc<Mutex<Connection>>,
    job_id: String,
    drive_id: String,
    root_path: String,
    incremental: bool,
    cancel_flag: CancelFlag,
) {
    let start_time = std::time::Instant::now();
    let window = match app_handle.get_webview_window("main") {
        Some(w) => w,
        None => return,
    };

    let _ = window.emit("indexing:started", serde_json::json!({
        "job_id": job_id,
        "drive_id": drive_id,
    }));

    // Walk directory tree, filtering to supported media files only.
    // Skip macOS resource fork files (starting with ._)
    let entries: Vec<_> = WalkDir::new(&root_path)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .filter(|e| {
            // Skip macOS resource fork files
            let file_name = e.file_name().to_string_lossy();
            if file_name.starts_with("._") { return false; }
            // Check supported extension (case-insensitive)
            e.path().extension()
                .and_then(|ext| ext.to_str())
                .map(|ext| is_supported_extension(ext))
                .unwrap_or(false)
        })
        .collect();

    let total_files = entries.len() as u64;
    let mut files_indexed: u64 = 0;
    let mut files_skipped: u64 = 0;

    for (i, entry) in entries.iter().enumerate() {
        if *cancel_flag.lock().unwrap_or_else(|e| e.into_inner()) {
            let _ = window.emit("indexing:cancelled", serde_json::json!({ "job_id": job_id }));
            return;
        }

        let path = entry.path();
        let percent = if total_files > 0 {
            ((i as f64 / total_files as f64) * 100.0) as u8
        } else { 100 };

        // Emit progress every 10 files
        if i % 10 == 0 {
            let _ = window.emit("indexing:progress", IndexingProgressEvent {
                job_id: job_id.clone(),
                drive_id: drive_id.clone(),
                files_found: total_files,
                files_indexed,
                files_skipped,
                percent_complete: percent,
            });
        }

        match index_file(&db, &drive_id, path, incremental) {
            Ok(true) => files_indexed += 1,
            Ok(false) => files_skipped += 1,
            Err(e) => {
                log::warn!("Failed to index {:?}: {}", path, e);
                files_skipped += 1;
            }
        }
    }

    let duration_ms = start_time.elapsed().as_millis() as u64;

    let _ = window.emit("indexing:complete", IndexingCompleteEvent {
        job_id: job_id.clone(),
        drive_id,
        total_indexed: files_indexed,
        total_skipped: files_skipped,
        duration_ms,
    });

    log::info!("Indexing complete: {} indexed, {} skipped in {}ms",
        files_indexed, files_skipped, duration_ms);
}

/// Index a single file. Returns Ok(true) if indexed, Ok(false) if skipped.
fn index_file(
    db: &Arc<Mutex<Connection>>,
    drive_id: &str,
    path: &Path,
    incremental: bool,
) -> Result<bool, crate::error::AppError> {
    let conn = db.lock().map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    let filename = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();

    let file_path = path.to_string_lossy().to_string();

    let file_meta = std::fs::metadata(path)
        .map_err(|e| crate::error::AppError::Filesystem(e.to_string()))?;

    let file_size = file_meta.len() as i64;

    let modified_at_fs = file_meta.modified().ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    // Incremental check — skip if file size and modification date unchanged
    if incremental {
        let existing: Option<(i64, i64)> = conn.query_row(
            "SELECT l.last_seen_at, a.file_size FROM locations l
             JOIN assets a ON a.id = l.asset_id
             WHERE l.drive_id = ?1 AND l.file_path = ?2",
            rusqlite::params![drive_id, file_path],
            |row| Ok((row.get(0)?, row.get(1)?)),
        ).ok();

        if let Some((last_seen, existing_size)) = existing {
            if existing_size == file_size && last_seen >= modified_at_fs {
                let _ = conn.execute(
                    "UPDATE locations SET last_seen_at = ?1 WHERE drive_id = ?2 AND file_path = ?3",
                    rusqlite::params![now_secs(), drive_id, file_path],
                );
                return Ok(false);
            }
        }
    }

    // Compute fingerprint for every file
    let fingerprint = compute_fingerprint(path)?;

    // Check for existing asset with same fingerprint (duplicate detection)
    let existing_asset_id: Option<String> = conn.query_row(
        "SELECT id FROM assets WHERE fingerprint = ?1",
        rusqlite::params![fingerprint],
        |row| row.get(0),
    ).ok();

    let now = now_secs();

    if let Some(asset_id) = existing_asset_id {
        // Duplicate — add or update location record only
        let location_exists: bool = conn.query_row(
            "SELECT COUNT(*) FROM locations WHERE asset_id = ?1 AND drive_id = ?2 AND file_path = ?3",
            rusqlite::params![asset_id, drive_id, file_path],
            |row| row.get::<_, i64>(0),
        ).map(|c| c > 0).unwrap_or(false);

        if !location_exists {
            let location_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO locations (id, asset_id, drive_id, file_path, filename, is_missing, first_seen_at, last_seen_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?6)",
                rusqlite::params![location_id, asset_id, drive_id, file_path, filename, now],
            ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;
        } else {
            conn.execute(
                "UPDATE locations SET last_seen_at = ?1, is_missing = 0
                 WHERE asset_id = ?2 AND drive_id = ?3 AND file_path = ?4",
                rusqlite::params![now, asset_id, drive_id, file_path],
            ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;
        }
    } else {
        // New asset — extract metadata and insert
        let ext = path.extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();

        let meta = extract_metadata(path).unwrap_or_else(|_| {
            crate::indexer::metadata::MediaMetadata {
                media_type: media_type_from_extension(&ext)
                    .unwrap_or("video")
                    .to_string(),
                ..Default::default()
            }
        });

        let asset_id = Uuid::new_v4().to_string();

        conn.execute(
            "INSERT INTO assets (id, fingerprint, media_type, file_extension, file_size,
             duration_ms, width, height, codec, frame_rate, sample_rate,
             created_at_fs, modified_at_fs, is_orphaned, indexed_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 0, ?14, ?14)",
            rusqlite::params![
                asset_id, fingerprint, meta.media_type, ext, file_size,
                meta.duration_ms, meta.width, meta.height, meta.codec,
                meta.frame_rate, meta.sample_rate,
                meta.created_at_fs, meta.modified_at_fs, now
            ],
        ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

        let location_id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO locations (id, asset_id, drive_id, file_path, filename, is_missing, first_seen_at, last_seen_at)
             VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?6)",
            rusqlite::params![location_id, asset_id, drive_id, file_path, filename, now],
        ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;
    }

    Ok(true)
}

fn now_secs() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
