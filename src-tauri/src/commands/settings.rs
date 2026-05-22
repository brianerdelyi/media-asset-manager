//! Tauri command handlers for settings and library statistics.

use crate::AppState;
use serde::Serialize;
use std::collections::HashMap;

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

#[tauri::command]
pub async fn settings_get_stats(state: tauri::State<'_, AppState>) -> Result<LibraryStats, String> {
    let conn = state.db_read.lock().map_err(|e| e.to_string())?;
    Ok(LibraryStats {
        total_assets:    conn.query_row("SELECT COUNT(*) FROM assets", [], |r| r.get(0)).unwrap_or(0),
        total_video:     conn.query_row("SELECT COUNT(*) FROM assets WHERE media_type = 'video'", [], |r| r.get(0)).unwrap_or(0),
        total_image:     conn.query_row("SELECT COUNT(*) FROM assets WHERE media_type = 'image'", [], |r| r.get(0)).unwrap_or(0),
        total_audio:     conn.query_row("SELECT COUNT(*) FROM assets WHERE media_type = 'audio'", [], |r| r.get(0)).unwrap_or(0),
        total_size_bytes:conn.query_row("SELECT COALESCE(SUM(file_size), 0) FROM assets", [], |r| r.get(0)).unwrap_or(0),
        orphaned_assets: conn.query_row("SELECT COUNT(*) FROM assets WHERE is_orphaned = 1", [], |r| r.get(0)).unwrap_or(0),
        missing_locations:conn.query_row("SELECT COUNT(*) FROM locations WHERE is_missing = 1", [], |r| r.get(0)).unwrap_or(0),
        thumbnail_count: conn.query_row("SELECT COUNT(*) FROM assets WHERE thumbnail_path IS NOT NULL", [], |r| r.get(0)).unwrap_or(0),
        total_markers:   conn.query_row("SELECT COUNT(*) FROM markers", [], |r| r.get(0)).unwrap_or(0),
        total_tags:      conn.query_row("SELECT COUNT(*) FROM tags", [], |r| r.get(0)).unwrap_or(0),
    })
}

#[tauri::command]
pub async fn settings_get(state: tauri::State<'_, AppState>, key: String) -> Result<Option<String>, String> {
    let conn = state.db_read.lock().map_err(|e| e.to_string())?;
    Ok(conn.query_row("SELECT value FROM settings WHERE key = ?1", rusqlite::params![key], |r| r.get(0)).ok())
}

#[tauri::command]
pub async fn settings_set(state: tauri::State<'_, AppState>, key: String, value: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = now_secs();
    conn.execute(
        "INSERT INTO settings (key, value, updated_at) VALUES (?1, ?2, ?3)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
        rusqlite::params![key, value, now],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

/// Returns all asset name overrides as a map of asset_id -> name.
/// Keys in settings are stored as "asset_name:<asset_id>".
#[tauri::command]
pub async fn settings_get_asset_names(state: tauri::State<'_, AppState>) -> Result<HashMap<String, String>, String> {
    let conn = state.db_read.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT key, value FROM settings WHERE key LIKE 'asset_name:%'")
        .map_err(|e| e.to_string())?;
    let map: HashMap<String, String> = stmt
        .query_map([], |row| {
            let key: String = row.get(0)?;
            let value: String = row.get(1)?;
            Ok((key, value))
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .filter_map(|(key, value)| {
            // Strip "asset_name:" prefix to get the asset_id
            key.strip_prefix("asset_name:").map(|id| (id.to_string(), value))
        })
        .collect();
    Ok(map)
}

#[tauri::command]
pub async fn settings_delete_orphaned(state: tauri::State<'_, AppState>) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM assets WHERE is_orphaned = 1", [], |r| r.get(0)).unwrap_or(0);
    conn.execute("DELETE FROM assets WHERE is_orphaned = 1", []).map_err(|e| e.to_string())?;
    Ok(count)
}

#[tauri::command]
pub async fn settings_purge_thumbnails(state: tauri::State<'_, AppState>) -> Result<u64, String> {
    let thumbnails_dir = crate::library::resolve_thumbnails_path().map_err(|e| e.to_string())?;
    let count = crate::indexer::thumbnails::purge_all_thumbnails(&thumbnails_dir).map_err(|e| e.to_string())?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("UPDATE assets SET thumbnail_path = NULL WHERE thumbnail_path IS NOT NULL", []).map_err(|e| e.to_string())?;
    Ok(count)
}

fn now_secs() -> i64 {
    std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs() as i64
}
