//! Tauri command handlers for settings and library statistics.

use crate::AppState;
use serde::Serialize;

#[derive(Serialize)]
pub struct LibraryStats {
    pub total_assets: i64,
    pub total_video: i64,
    pub total_image: i64,
    pub total_audio: i64,
    pub total_size_bytes: i64,
    pub orphaned_assets: i64,
    pub missing_locations: i64,
    pub thumbnail_count: i64,
    pub total_markers: i64,
    pub total_tags: i64,
}

#[derive(Serialize)]
pub struct SettingValue {
    pub key: String,
    pub value: String,
}

/// Get library statistics.
#[tauri::command]
pub async fn settings_get_stats(
    state: tauri::State<'_, AppState>,
) -> Result<LibraryStats, String> {
    let conn = state.db_read.lock().map_err(|e| e.to_string())?;

    let total_assets: i64 = conn.query_row("SELECT COUNT(*) FROM assets", [], |r| r.get(0)).unwrap_or(0);
    let total_video: i64 = conn.query_row("SELECT COUNT(*) FROM assets WHERE media_type = 'video'", [], |r| r.get(0)).unwrap_or(0);
    let total_image: i64 = conn.query_row("SELECT COUNT(*) FROM assets WHERE media_type = 'image'", [], |r| r.get(0)).unwrap_or(0);
    let total_audio: i64 = conn.query_row("SELECT COUNT(*) FROM assets WHERE media_type = 'audio'", [], |r| r.get(0)).unwrap_or(0);
    let total_size_bytes: i64 = conn.query_row("SELECT COALESCE(SUM(file_size), 0) FROM assets", [], |r| r.get(0)).unwrap_or(0);
    let orphaned_assets: i64 = conn.query_row("SELECT COUNT(*) FROM assets WHERE is_orphaned = 1", [], |r| r.get(0)).unwrap_or(0);
    let missing_locations: i64 = conn.query_row("SELECT COUNT(*) FROM locations WHERE is_missing = 1", [], |r| r.get(0)).unwrap_or(0);
    let thumbnail_count: i64 = conn.query_row("SELECT COUNT(*) FROM assets WHERE thumbnail_path IS NOT NULL", [], |r| r.get(0)).unwrap_or(0);
    let total_markers: i64 = conn.query_row("SELECT COUNT(*) FROM markers", [], |r| r.get(0)).unwrap_or(0);
    let total_tags: i64 = conn.query_row("SELECT COUNT(*) FROM tags", [], |r| r.get(0)).unwrap_or(0);

    Ok(LibraryStats {
        total_assets,
        total_video,
        total_image,
        total_audio,
        total_size_bytes,
        orphaned_assets,
        missing_locations,
        thumbnail_count,
        total_markers,
        total_tags,
    })
}

/// Get a setting value by key.
#[tauri::command]
pub async fn settings_get(
    state: tauri::State<'_, AppState>,
    key: String,
) -> Result<Option<String>, String> {
    let conn = state.db_read.lock().map_err(|e| e.to_string())?;
    let value: Option<String> = conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        rusqlite::params![key],
        |r| r.get(0),
    ).ok();
    Ok(value)
}

/// Set a setting value.
#[tauri::command]
pub async fn settings_set(
    state: tauri::State<'_, AppState>,
    key: String,
    value: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = now_secs();
    conn.execute(
        "INSERT INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        rusqlite::params![key, value, now],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

/// Delete all orphaned assets (assets with no drive locations).
#[tauri::command]
pub async fn settings_delete_orphaned(
    state: tauri::State<'_, AppState>,
) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM assets WHERE is_orphaned = 1",
        [],
        |r| r.get(0),
    ).unwrap_or(0);
    conn.execute("DELETE FROM assets WHERE is_orphaned = 1", [])
        .map_err(|e| e.to_string())?;
    Ok(count)
}

/// Purge all thumbnail files from disk and clear paths in DB.
#[tauri::command]
pub async fn settings_purge_thumbnails(
    state: tauri::State<'_, AppState>,
) -> Result<u64, String> {
    let thumbnails_dir = crate::library::resolve_thumbnails_path()
        .map_err(|e| e.to_string())?;

    let count = crate::indexer::thumbnails::purge_all_thumbnails(&thumbnails_dir)
        .map_err(|e| e.to_string())?;

    // Clear thumbnail paths in DB
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("UPDATE assets SET thumbnail_path = NULL WHERE thumbnail_path IS NOT NULL", [])
        .map_err(|e| e.to_string())?;

    Ok(count)
}

fn now_secs() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
