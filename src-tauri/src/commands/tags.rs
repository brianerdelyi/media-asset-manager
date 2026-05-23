//! Tag command handlers.
use crate::AppState;
use crate::models::tag::Tag;
use rusqlite::params;
use uuid::Uuid;

/// List all tags ordered by name, with asset count.
#[tauri::command]
pub async fn tag_list(state: tauri::State<'_, AppState>) -> Result<Vec<Tag>, String> {
    let conn = state.db_read.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT t.id, t.name_display, t.name_normalized,
                COUNT(at.asset_id) as asset_count
         FROM tags t
         LEFT JOIN asset_tags at ON at.tag_id = t.id
         GROUP BY t.id
         ORDER BY t.name_normalized ASC",
    ).map_err(|e| e.to_string())?;

    let tags = stmt.query_map([], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name_display: row.get(1)?,
            name_normalized: row.get(2)?,
            asset_count: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();

    Ok(tags)
}

/// Create a new tag. Rejects duplicates (case-insensitive).
#[tauri::command]
pub async fn tag_create(state: tauri::State<'_, AppState>, name: String) -> Result<Tag, String> {
    let name_display = name.trim().to_string();
    if name_display.is_empty() {
        return Err("Tag name cannot be empty".to_string());
    }
    let name_normalized = name_display.to_lowercase();

    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Check for duplicate
    let exists: bool = conn.query_row(
        "SELECT COUNT(*) FROM tags WHERE name_normalized = ?1",
        params![name_normalized],
        |row| row.get::<_, i64>(0),
    ).map(|c| c > 0).unwrap_or(false);

    if exists {
        return Err(format!("Tag '{}' already exists", name_display));
    }

    let id = Uuid::new_v4().to_string();
    let now = now_secs();

    conn.execute(
        "INSERT INTO tags (id, name_display, name_normalized, created_at) VALUES (?1, ?2, ?3, ?4)",
        params![id, name_display, name_normalized, now],
    ).map_err(|e| e.to_string())?;

    Ok(Tag { id, name_display, name_normalized, asset_count: 0 })
}

/// Delete a tag and all its asset associations.
#[tauri::command]
pub async fn tag_delete(state: tauri::State<'_, AppState>, tag_id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tags WHERE id = ?1", params![tag_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Replace all tags for an asset in a single transaction.
/// Pass an empty vec to remove all tags.
#[tauri::command]
pub async fn asset_tags_set(
    state: tauri::State<'_, AppState>,
    asset_id: String,
    tag_ids: Vec<String>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = now_secs();

    // Remove all existing tags for this asset
    conn.execute("DELETE FROM asset_tags WHERE asset_id = ?1", params![asset_id])
        .map_err(|e| e.to_string())?;

    // Insert new tags
    for tag_id in &tag_ids {
        conn.execute(
            "INSERT OR IGNORE INTO asset_tags (asset_id, tag_id, tagged_at) VALUES (?1, ?2, ?3)",
            params![asset_id, tag_id, now],
        ).map_err(|e| e.to_string())?;
    }

    Ok(())
}

fn now_secs() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
