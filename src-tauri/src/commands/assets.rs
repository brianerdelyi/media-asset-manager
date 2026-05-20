//! Tauri command handlers for asset operations.
//! Uses db_read (read-only connection) to avoid blocking the indexer.

use crate::AppState;
use crate::models::asset::{AssetDetail, AssetSearchFilters, AssetSearchResult, AssetSort};

#[tauri::command]
pub async fn asset_search(
    state: tauri::State<'_, AppState>,
    filters: AssetSearchFilters,
    sort: Option<AssetSort>,
    page: Option<i64>,
    page_size: Option<i64>,
) -> Result<AssetSearchResult, String> {
    let conn = state.db_read.lock().map_err(|e| e.to_string())?;
    crate::assets::search_assets(
        &conn,
        &filters,
        sort.as_ref(),
        page.unwrap_or(1),
        page_size.unwrap_or(50),
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn asset_get(
    state: tauri::State<'_, AppState>,
    asset_id: String,
) -> Result<AssetDetail, String> {
    let conn = state.db_read.lock().map_err(|e| e.to_string())?;
    crate::assets::get_asset(&conn, &asset_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn asset_delete(
    state: tauri::State<'_, AppState>,
    asset_id: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crate::assets::delete_asset(&conn, &asset_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn asset_open(
    state: tauri::State<'_, AppState>,
    asset_id: String,
    location_id: String,
) -> Result<(), String> {
    let file_path: String = {
        let conn = state.db_read.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT file_path FROM locations WHERE id = ?1 AND asset_id = ?2",
            rusqlite::params![location_id, asset_id],
            |row| row.get(0),
        ).map_err(|_| "Location not found".to_string())?
    };

    crate::drives::platform::open_with_default_app(std::path::Path::new(&file_path))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn asset_reveal(
    state: tauri::State<'_, AppState>,
    asset_id: String,
    location_id: String,
) -> Result<(), String> {
    let file_path: String = {
        let conn = state.db_read.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT file_path FROM locations WHERE id = ?1 AND asset_id = ?2",
            rusqlite::params![location_id, asset_id],
            |row| row.get(0),
        ).map_err(|_| "Location not found".to_string())?
    };

    crate::drives::platform::reveal_in_file_manager(std::path::Path::new(&file_path))
        .map_err(|e| e.to_string())
}
