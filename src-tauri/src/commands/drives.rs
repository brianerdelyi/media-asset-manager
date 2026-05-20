//! Tauri command handlers for drive management.
use crate::AppState;
use crate::models::drive::{Drive, DriveRemovePreview, DriveRemoveResult};

#[tauri::command]
pub async fn drive_register(
    state: tauri::State<'_, AppState>,
    path: String,
    friendly_name: String,
) -> Result<Drive, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crate::drives::manager::register_drive(&conn, &path, &friendly_name)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn drive_list(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<Drive>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crate::drives::manager::list_drives(&conn)
        .map_err(|e| e.to_string())
}

/// Preview drive removal — uses write connection to see latest WAL data.
#[tauri::command]
pub async fn drive_remove(
    state: tauri::State<'_, AppState>,
    drive_id: String,
) -> Result<DriveRemovePreview, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crate::drives::manager::preview_remove_drive(&conn, &drive_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn drive_remove_confirm(
    state: tauri::State<'_, AppState>,
    drive_id: String,
    delete_orphaned_assets: bool,
) -> Result<DriveRemoveResult, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crate::drives::manager::remove_drive(&conn, &drive_id, delete_orphaned_assets)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn drive_rename(
    state: tauri::State<'_, AppState>,
    drive_id: String,
    friendly_name: String,
) -> Result<Drive, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crate::drives::manager::rename_drive(&conn, &drive_id, &friendly_name)
        .map_err(|e| e.to_string())
}
