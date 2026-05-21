//! Tauri command handlers for marker operations.

use crate::AppState;
use crate::models::asset::AssetMarker;
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct CreateMarkerParams {
    pub asset_id: String,
    pub name: String,
    pub marker_type: String,  // "point" | "clip"
    pub position_ms: i64,
    pub end_position_ms: Option<i64>,
}

#[derive(Deserialize)]
pub struct UpdateMarkerParams {
    pub name: Option<String>,
    pub position_ms: Option<i64>,
    pub end_position_ms: Option<i64>,
}

/// Create a new marker on an asset.
#[tauri::command]
pub async fn marker_create(
    state: tauri::State<'_, AppState>,
    params: CreateMarkerParams,
) -> Result<AssetMarker, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = now_secs();

    conn.execute(
        "INSERT INTO markers (id, asset_id, name, marker_type, position_ms, end_position_ms, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)",
        rusqlite::params![
            id, params.asset_id, params.name, params.marker_type,
            params.position_ms, params.end_position_ms, now
        ],
    ).map_err(|e| e.to_string())?;

    Ok(AssetMarker {
        id,
        name: params.name,
        marker_type: params.marker_type,
        position_ms: params.position_ms,
        end_position_ms: params.end_position_ms,
    })
}

/// Update an existing marker.
#[tauri::command]
pub async fn marker_update(
    state: tauri::State<'_, AppState>,
    marker_id: String,
    params: UpdateMarkerParams,
) -> Result<AssetMarker, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = now_secs();

    if let Some(name) = &params.name {
        conn.execute(
            "UPDATE markers SET name = ?1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![name, now, marker_id],
        ).map_err(|e| e.to_string())?;
    }
    if let Some(pos) = params.position_ms {
        conn.execute(
            "UPDATE markers SET position_ms = ?1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![pos, now, marker_id],
        ).map_err(|e| e.to_string())?;
    }
    if params.end_position_ms.is_some() {
        conn.execute(
            "UPDATE markers SET end_position_ms = ?1, updated_at = ?2 WHERE id = ?3",
            rusqlite::params![params.end_position_ms, now, marker_id],
        ).map_err(|e| e.to_string())?;
    }

    conn.query_row(
        "SELECT id, name, marker_type, position_ms, end_position_ms FROM markers WHERE id = ?1",
        rusqlite::params![marker_id],
        |row| Ok(AssetMarker {
            id: row.get(0)?,
            name: row.get(1)?,
            marker_type: row.get(2)?,
            position_ms: row.get(3)?,
            end_position_ms: row.get(4)?,
        }),
    ).map_err(|e| e.to_string())
}

/// Delete a marker.
#[tauri::command]
pub async fn marker_delete(
    state: tauri::State<'_, AppState>,
    marker_id: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM markers WHERE id = ?1", rusqlite::params![marker_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn now_secs() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
