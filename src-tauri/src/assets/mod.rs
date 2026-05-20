//! Asset query and management logic.

use rusqlite::{Connection, params};
use crate::models::asset::{
    AssetDetail, AssetLocation, AssetMarker, AssetSearchFilters,
    AssetSearchResult, AssetSort, AssetSummary, AssetTag,
};

/// Search assets with filters, sorting, and pagination.
pub fn search_assets(
    conn: &Connection,
    filters: &AssetSearchFilters,
    sort: Option<&AssetSort>,
    page: i64,
    page_size: i64,
) -> Result<AssetSearchResult, crate::error::AppError> {
    let offset = (page - 1) * page_size;

    let mut conditions: Vec<String> = Vec::new();
    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(q) = &filters.query {
        if !q.trim().is_empty() {
            conditions.push(
                "EXISTS (SELECT 1 FROM locations l WHERE l.asset_id = a.id AND l.filename LIKE ?)".to_string(),
            );
            params_vec.push(Box::new(format!("%{}%", q.trim())));
        }
    }

    if let Some(types) = &filters.media_types {
        if !types.is_empty() {
            let placeholders = types.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
            conditions.push(format!("a.media_type IN ({})", placeholders));
            for t in types { params_vec.push(Box::new(t.clone())); }
        }
    }

    if let Some(drive_ids) = &filters.drive_ids {
        if !drive_ids.is_empty() {
            let placeholders = drive_ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
            conditions.push(format!(
                "EXISTS (SELECT 1 FROM locations l WHERE l.asset_id = a.id AND l.drive_id IN ({}))",
                placeholders
            ));
            for id in drive_ids { params_vec.push(Box::new(id.clone())); }
        }
    }

    if let Some(from) = filters.date_from {
        conditions.push("a.created_at_fs >= ?".to_string());
        params_vec.push(Box::new(from));
    }
    if let Some(to) = filters.date_to {
        conditions.push("a.created_at_fs <= ?".to_string());
        params_vec.push(Box::new(to));
    }

    if let Some(true) = filters.has_markers {
        conditions.push("EXISTS (SELECT 1 FROM markers m WHERE m.asset_id = a.id)".to_string());
    }

    match filters.status.as_deref() {
        Some("orphaned") => conditions.push("a.is_orphaned = 1".to_string()),
        Some("missing") => conditions.push(
            "EXISTS (SELECT 1 FROM locations l WHERE l.asset_id = a.id AND l.is_missing = 1)".to_string(),
        ),
        _ => {}
    }

    if let Some(tag_ids) = &filters.tag_ids {
        if !tag_ids.is_empty() {
            for tag_id in tag_ids {
                conditions.push(
                    "EXISTS (SELECT 1 FROM asset_tags at WHERE at.asset_id = a.id AND at.tag_id = ?)".to_string(),
                );
                params_vec.push(Box::new(tag_id.clone()));
            }
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sort_clause = match sort {
        Some(s) => {
            let field = match s.field.as_str() {
                "filename" => "primary_filename",
                "file_size" => "a.file_size",
                "media_type" => "a.media_type",
                _ => "a.created_at_fs",
            };
            let dir = if s.direction == "asc" { "ASC" } else { "DESC" };
            format!("ORDER BY {} {} NULLS LAST", field, dir)
        }
        None => "ORDER BY a.created_at_fs DESC NULLS LAST".to_string(),
    };

    // Count
    let count_sql = format!("SELECT COUNT(*) FROM assets a {}", where_clause);
    let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();
    let total: i64 = conn.query_row(&count_sql, params_refs.as_slice(), |row| row.get(0))
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    // Data — includes codec field
    let data_sql = format!(
        "SELECT
            a.id,
            a.media_type,
            a.file_extension,
            a.file_size,
            a.duration_ms,
            a.width,
            a.height,
            a.codec,
            a.created_at_fs,
            a.thumbnail_path,
            a.is_orphaned,
            (SELECT l.filename FROM locations l WHERE l.asset_id = a.id LIMIT 1) as primary_filename,
            (SELECT d.friendly_name FROM locations l JOIN drives d ON d.id = l.drive_id WHERE l.asset_id = a.id LIMIT 1) as primary_drive_name,
            (SELECT d.is_online FROM locations l JOIN drives d ON d.id = l.drive_id WHERE l.asset_id = a.id LIMIT 1) as primary_drive_online,
            (SELECT COUNT(*) FROM locations l WHERE l.asset_id = a.id) as location_count,
            (SELECT COUNT(*) FROM asset_tags at WHERE at.asset_id = a.id) as tag_count,
            (SELECT COUNT(*) FROM markers m WHERE m.asset_id = a.id) as marker_count
         FROM assets a
         {}
         {}
         LIMIT ? OFFSET ?",
        where_clause, sort_clause
    );

    // Rebuild params for data query
    let mut data_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    if let Some(q) = &filters.query {
        if !q.trim().is_empty() { data_params.push(Box::new(format!("%{}%", q.trim()))); }
    }
    if let Some(types) = &filters.media_types {
        for t in types { data_params.push(Box::new(t.clone())); }
    }
    if let Some(drive_ids) = &filters.drive_ids {
        for id in drive_ids { data_params.push(Box::new(id.clone())); }
    }
    if let Some(from) = filters.date_from { data_params.push(Box::new(from)); }
    if let Some(to) = filters.date_to { data_params.push(Box::new(to)); }
    if let Some(tag_ids) = &filters.tag_ids {
        for id in tag_ids { data_params.push(Box::new(id.clone())); }
    }
    data_params.push(Box::new(page_size));
    data_params.push(Box::new(offset));

    let data_refs: Vec<&dyn rusqlite::ToSql> = data_params.iter().map(|p| p.as_ref()).collect();
    let mut stmt = conn.prepare(&data_sql)
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    let assets = stmt.query_map(data_refs.as_slice(), |row| {
        Ok(AssetSummary {
            id: row.get(0)?,
            media_type: row.get(1)?,
            file_extension: row.get(2)?,
            file_size: row.get(3)?,
            duration_ms: row.get(4)?,
            width: row.get(5)?,
            height: row.get(6)?,
            codec: row.get(7)?,
            created_at_fs: row.get(8)?,
            thumbnail_path: row.get(9)?,
            is_orphaned: row.get::<_, i64>(10)? != 0,
            filename: row.get::<_, Option<String>>(11)?.unwrap_or_default(),
            primary_drive_name: row.get(12)?,
            primary_drive_online: row.get::<_, Option<i64>>(13)?.unwrap_or(0) != 0,
            location_count: row.get(14)?,
            tag_count: row.get(15)?,
            marker_count: row.get(16)?,
        })
    }).map_err(|e| crate::error::AppError::Database(e.to_string()))?
    .filter_map(|r| r.ok())
    .collect();

    Ok(AssetSearchResult { data: assets, total, page, page_size })
}

/// Get full asset detail including locations, tags, and markers.
pub fn get_asset(
    conn: &Connection,
    asset_id: &str,
) -> Result<AssetDetail, crate::error::AppError> {
    let asset = conn.query_row(
        "SELECT id, media_type, file_extension, file_size, duration_ms, width, height,
                codec, frame_rate, sample_rate, created_at_fs, modified_at_fs,
                thumbnail_path, is_orphaned
         FROM assets WHERE id = ?1",
        params![asset_id],
        |row| Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, i64>(3)?,
            row.get::<_, Option<i64>>(4)?,
            row.get::<_, Option<i64>>(5)?,
            row.get::<_, Option<i64>>(6)?,
            row.get::<_, Option<String>>(7)?,
            row.get::<_, Option<f64>>(8)?,
            row.get::<_, Option<i64>>(9)?,
            row.get::<_, Option<i64>>(10)?,
            row.get::<_, Option<i64>>(11)?,
            row.get::<_, Option<String>>(12)?,
            row.get::<_, i64>(13)?,
        )),
    ).map_err(|_| crate::error::AppError::NotFound("Asset not found".to_string()))?;

    let mut loc_stmt = conn.prepare(
        "SELECT l.id, l.drive_id, d.friendly_name, d.is_online, l.file_path, l.filename,
                l.is_missing, l.last_seen_at
         FROM locations l
         JOIN drives d ON d.id = l.drive_id
         WHERE l.asset_id = ?1
         ORDER BY l.first_seen_at ASC",
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    let locations: Vec<AssetLocation> = loc_stmt.query_map(params![asset_id], |row| {
        Ok(AssetLocation {
            id: row.get(0)?,
            drive_id: row.get(1)?,
            drive_name: row.get(2)?,
            is_online: row.get::<_, i64>(3)? != 0,
            file_path: row.get(4)?,
            filename: row.get(5)?,
            is_missing: row.get::<_, i64>(6)? != 0,
            last_seen_at: row.get(7)?,
        })
    }).map_err(|e| crate::error::AppError::Database(e.to_string()))?
    .filter_map(|r| r.ok())
    .collect();

    let mut tag_stmt = conn.prepare(
        "SELECT t.id, t.name_display, t.name_normalized
         FROM tags t
         JOIN asset_tags at ON at.tag_id = t.id
         WHERE at.asset_id = ?1
         ORDER BY t.name_normalized ASC",
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    let tags: Vec<AssetTag> = tag_stmt.query_map(params![asset_id], |row| {
        Ok(AssetTag {
            id: row.get(0)?,
            name_display: row.get(1)?,
            name_normalized: row.get(2)?,
        })
    }).map_err(|e| crate::error::AppError::Database(e.to_string()))?
    .filter_map(|r| r.ok())
    .collect();

    let mut marker_stmt = conn.prepare(
        "SELECT id, name, marker_type, position_ms, end_position_ms
         FROM markers WHERE asset_id = ?1
         ORDER BY position_ms ASC",
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    let markers: Vec<AssetMarker> = marker_stmt.query_map(params![asset_id], |row| {
        Ok(AssetMarker {
            id: row.get(0)?,
            name: row.get(1)?,
            marker_type: row.get(2)?,
            position_ms: row.get(3)?,
            end_position_ms: row.get(4)?,
        })
    }).map_err(|e| crate::error::AppError::Database(e.to_string()))?
    .filter_map(|r| r.ok())
    .collect();

    Ok(AssetDetail {
        id: asset.0, media_type: asset.1, file_extension: asset.2,
        file_size: asset.3, duration_ms: asset.4, width: asset.5, height: asset.6,
        codec: asset.7, frame_rate: asset.8, sample_rate: asset.9,
        created_at_fs: asset.10, modified_at_fs: asset.11,
        thumbnail_path: asset.12, is_orphaned: asset.13 != 0,
        locations, tags, markers,
    })
}

/// Delete an asset and all associated data.
pub fn delete_asset(
    conn: &Connection,
    asset_id: &str,
) -> Result<(), crate::error::AppError> {
    conn.execute("DELETE FROM assets WHERE id = ?1", params![asset_id])
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;
    Ok(())
}
