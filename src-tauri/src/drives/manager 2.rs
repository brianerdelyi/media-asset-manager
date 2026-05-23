//! Drive registration and management logic.
use rusqlite::{Connection, params};
use uuid::Uuid;
use crate::models::drive::{Drive, DriveRemovePreview, DriveRemoveResult};

pub fn register_drive(
    conn: &Connection,
    path: &str,
    friendly_name: &str,
    index_media_types: &str,
) -> Result<Drive, crate::error::AppError> {
    let platform_uuid = crate::drives::platform::get_drive_uuid(std::path::Path::new(path))
        .unwrap_or_else(|_| format!("path:{}", path));

    let existing: Option<String> = conn.query_row(
        "SELECT id FROM drives WHERE platform_uuid = ?1",
        params![platform_uuid],
        |row| row.get(0),
    ).ok();

    if existing.is_some() {
        return Err(crate::error::AppError::InvalidParameters(
            "This drive is already registered".to_string()
        ));
    }

    let id = Uuid::new_v4().to_string();
    let now = now_secs();
    let drive_type = if path.starts_with("//") || path.starts_with("smb://") { "network" } else { "local" };

    conn.execute(
        "INSERT INTO drives (id, friendly_name, platform_uuid, drive_type, root_path, is_online, registered_at, index_media_types)
         VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6, ?7)",
        params![id, friendly_name, platform_uuid, drive_type, path, now, index_media_types],
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    get_drive(conn, &id)
}

pub fn get_drive(conn: &Connection, id: &str) -> Result<Drive, crate::error::AppError> {
    conn.query_row(
        "SELECT d.id, d.friendly_name, d.platform_uuid, d.drive_type, d.root_path,
                d.is_online, d.registered_at, d.last_seen_at,
                COUNT(DISTINCT l.asset_id) as asset_count,
                d.index_media_types
         FROM drives d
         LEFT JOIN locations l ON l.drive_id = d.id
         WHERE d.id = ?1
         GROUP BY d.id",
        params![id],
        row_to_drive,
    ).map_err(|e| crate::error::AppError::NotFound(format!("Drive not found: {}", e)))
}

pub fn list_drives(conn: &Connection) -> Result<Vec<Drive>, crate::error::AppError> {
    let mut stmt = conn.prepare(
        "SELECT d.id, d.friendly_name, d.platform_uuid, d.drive_type, d.root_path,
                d.is_online, d.registered_at, d.last_seen_at,
                COUNT(DISTINCT l.asset_id) as asset_count,
                d.index_media_types
         FROM drives d
         LEFT JOIN locations l ON l.drive_id = d.id
         GROUP BY d.id
         ORDER BY d.registered_at ASC",
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    let drives = stmt.query_map([], row_to_drive)
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    Ok(drives)
}

pub fn preview_remove_drive(
    conn: &Connection,
    drive_id: &str,
) -> Result<DriveRemovePreview, crate::error::AppError> {
    let affected_asset_count: i64 = conn.query_row(
        "SELECT COUNT(DISTINCT asset_id) FROM locations WHERE drive_id = ?1",
        params![drive_id], |row| row.get(0),
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    let orphaned_asset_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM assets a
         WHERE EXISTS (SELECT 1 FROM locations l WHERE l.asset_id = a.id AND l.drive_id = ?1)
         AND (SELECT COUNT(*) FROM locations l2 WHERE l2.asset_id = a.id AND l2.drive_id != ?1) = 0",
        params![drive_id], |row| row.get(0),
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    Ok(DriveRemovePreview {
        orphaned_asset_count,
        affected_asset_count,
        requires_confirmation: orphaned_asset_count > 0,
    })
}

pub fn remove_drive(
    conn: &Connection,
    drive_id: &str,
    delete_orphaned_assets: bool,
) -> Result<DriveRemoveResult, crate::error::AppError> {
    let mut stmt = conn.prepare(
        "SELECT a.id FROM assets a
         WHERE EXISTS (SELECT 1 FROM locations l WHERE l.asset_id = a.id AND l.drive_id = ?1)
         AND (SELECT COUNT(*) FROM locations l2 WHERE l2.asset_id = a.id AND l2.drive_id != ?1) = 0",
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    let orphaned_ids: Vec<String> = stmt.query_map(params![drive_id], |row| row.get(0))
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    let orphaned_count = orphaned_ids.len() as i64;
    let removed_locations: i64 = conn.query_row(
        "SELECT COUNT(*) FROM locations WHERE drive_id = ?1",
        params![drive_id], |row| row.get(0),
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    if delete_orphaned_assets {
        for asset_id in &orphaned_ids {
            conn.execute("DELETE FROM assets WHERE id = ?1", params![asset_id])
                .map_err(|e| crate::error::AppError::Database(e.to_string()))?;
        }
    }

    conn.execute("DELETE FROM locations WHERE drive_id = ?1", params![drive_id])
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;
    conn.execute(
        "UPDATE assets SET is_orphaned = 1 WHERE is_orphaned = 0
         AND (SELECT COUNT(*) FROM locations l WHERE l.asset_id = assets.id) = 0",
        [],
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;
    conn.execute("DELETE FROM drives WHERE id = ?1", params![drive_id])
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    Ok(DriveRemoveResult {
        removed_locations,
        deleted_assets: if delete_orphaned_assets { orphaned_count } else { 0 },
        orphaned_assets: if delete_orphaned_assets { 0 } else { orphaned_count },
    })
}

pub fn rename_drive(conn: &Connection, drive_id: &str, friendly_name: &str) -> Result<Drive, crate::error::AppError> {
    conn.execute("UPDATE drives SET friendly_name = ?1 WHERE id = ?2", params![friendly_name, drive_id])
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;
    get_drive(conn, drive_id)
}

pub fn update_media_types(conn: &Connection, drive_id: &str, index_media_types: &str) -> Result<Drive, crate::error::AppError> {
    conn.execute("UPDATE drives SET index_media_types = ?1 WHERE id = ?2", params![index_media_types, drive_id])
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;
    get_drive(conn, drive_id)
}

fn row_to_drive(row: &rusqlite::Row) -> rusqlite::Result<Drive> {
    Ok(Drive {
        id: row.get(0)?,
        friendly_name: row.get(1)?,
        platform_uuid: row.get(2)?,
        drive_type: row.get(3)?,
        root_path: row.get(4)?,
        is_online: row.get::<_, i64>(5)? != 0,
        registered_at: row.get(6)?,
        last_seen_at: row.get(7)?,
        asset_count: row.get(8)?,
        index_media_types: row.get::<_, Option<String>>(9)?.unwrap_or_else(|| "video,image,audio".to_string()),
    })
}

fn now_secs() -> i64 {
    std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs() as i64
}
