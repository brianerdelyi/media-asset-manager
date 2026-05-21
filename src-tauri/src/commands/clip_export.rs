//! Tauri command handlers for clip export operations.

use crate::AppState;
use serde::Serialize;

#[derive(Serialize)]
pub struct ClipExportResult {
    pub output_path: String,
    pub duration_ms: i64,
}

/// Export a lossless clip from an asset using a marker's In/Out points.
/// The user selects the output path via a native save dialog on the frontend.
#[tauri::command]
pub async fn clip_export(
    state: tauri::State<'_, AppState>,
    asset_id: String,
    marker_id: String,
    output_path: String,
) -> Result<ClipExportResult, String> {
    // Get marker In/Out points
    let (in_ms, out_ms): (i64, Option<i64>) = {
        let conn = state.db_read.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT position_ms, end_position_ms FROM markers WHERE id = ?1 AND asset_id = ?2",
            rusqlite::params![marker_id, asset_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        ).map_err(|_| "Marker not found".to_string())?
    };

    let out_ms = out_ms.ok_or("Marker has no Out point — only range markers can be exported")?;

    if out_ms <= in_ms {
        return Err("Out point must be after In point".to_string());
    }

    // Get an online location for this asset
    let source_path: String = {
        let conn = state.db_read.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT l.file_path FROM locations l
             JOIN drives d ON d.id = l.drive_id
             WHERE l.asset_id = ?1 AND d.is_online = 1 AND l.is_missing = 0
             LIMIT 1",
            rusqlite::params![asset_id],
            |row| row.get(0),
        ).map_err(|_| "No online location found for this asset. Please connect the drive first.".to_string())?
    };

    // Run FFmpeg clip export
    crate::indexer::clip_export::export_clip(
        std::path::Path::new(&source_path),
        std::path::Path::new(&output_path),
        in_ms,
        out_ms,
    ).map_err(|e| e.to_string())?;

    Ok(ClipExportResult {
        output_path,
        duration_ms: out_ms - in_ms,
    })
}
