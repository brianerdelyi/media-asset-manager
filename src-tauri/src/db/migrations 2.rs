//! Database migration runner.
use rusqlite::Connection;

pub fn run(conn: &Connection) -> Result<(), crate::error::AppError> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version     INTEGER PRIMARY KEY,
            applied_at  INTEGER NOT NULL,
            description TEXT NOT NULL
        );",
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    apply(conn, 1, "initial_schema",        migration_001_initial_schema)?;
    apply(conn, 2, "drive_media_types",     migration_002_drive_media_types)?;
    apply(conn, 3, "transcripts",           migration_003_transcripts)?;
    Ok(())
}

fn apply(
    conn: &Connection,
    version: i64,
    description: &str,
    migration_fn: fn(&Connection) -> Result<(), crate::error::AppError>,
) -> Result<(), crate::error::AppError> {
    let already_applied: bool = conn
        .query_row(
            "SELECT COUNT(*) FROM schema_migrations WHERE version = ?1",
            [version],
            |row| row.get::<_, i64>(0),
        )
        .map(|count| count > 0)
        .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    if already_applied { return Ok(()); }

    migration_fn(conn)?;

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;

    conn.execute(
        "INSERT INTO schema_migrations (version, applied_at, description) VALUES (?1, ?2, ?3)",
        rusqlite::params![version, now, description],
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))?;

    Ok(())
}

fn migration_001_initial_schema(conn: &Connection) -> Result<(), crate::error::AppError> {
    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS drives (
            id              TEXT PRIMARY KEY,
            friendly_name   TEXT NOT NULL,
            platform_uuid   TEXT NOT NULL UNIQUE,
            drive_type      TEXT NOT NULL,
            root_path       TEXT NOT NULL,
            is_online       INTEGER NOT NULL DEFAULT 0,
            registered_at   INTEGER NOT NULL,
            last_seen_at    INTEGER
        );
        CREATE TABLE IF NOT EXISTS assets (
            id              TEXT PRIMARY KEY,
            fingerprint     TEXT NOT NULL UNIQUE,
            media_type      TEXT NOT NULL,
            file_extension  TEXT NOT NULL,
            file_size       INTEGER NOT NULL,
            duration_ms     INTEGER,
            width           INTEGER,
            height          INTEGER,
            codec           TEXT,
            frame_rate      REAL,
            sample_rate     INTEGER,
            created_at_fs   INTEGER,
            modified_at_fs  INTEGER,
            thumbnail_path  TEXT,
            is_orphaned     INTEGER NOT NULL DEFAULT 0,
            indexed_at      INTEGER NOT NULL,
            updated_at      INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS locations (
            id              TEXT PRIMARY KEY,
            asset_id        TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            drive_id        TEXT NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
            file_path       TEXT NOT NULL,
            filename        TEXT NOT NULL,
            is_missing      INTEGER NOT NULL DEFAULT 0,
            first_seen_at   INTEGER NOT NULL,
            last_seen_at    INTEGER NOT NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_asset_drive_path
            ON locations(asset_id, drive_id, file_path);
        CREATE TABLE IF NOT EXISTS tags (
            id              TEXT PRIMARY KEY,
            name_normalized TEXT NOT NULL UNIQUE,
            name_display    TEXT NOT NULL,
            created_at      INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS asset_tags (
            asset_id        TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            tag_id          TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            tagged_at       INTEGER NOT NULL,
            PRIMARY KEY (asset_id, tag_id)
        );
        CREATE TABLE IF NOT EXISTS markers (
            id              TEXT PRIMARY KEY,
            asset_id        TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            name            TEXT NOT NULL,
            marker_type     TEXT NOT NULL,
            position_ms     INTEGER NOT NULL,
            end_position_ms INTEGER,
            created_at      INTEGER NOT NULL,
            updated_at      INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS settings (
            key         TEXT PRIMARY KEY,
            value       TEXT NOT NULL,
            updated_at  INTEGER NOT NULL
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_fingerprint ON assets(fingerprint);
        CREATE INDEX IF NOT EXISTS idx_assets_media_type ON assets(media_type);
        CREATE INDEX IF NOT EXISTS idx_assets_created_at_fs ON assets(created_at_fs);
        CREATE INDEX IF NOT EXISTS idx_assets_is_orphaned ON assets(is_orphaned);
        CREATE INDEX IF NOT EXISTS idx_locations_drive_id ON locations(drive_id);
        CREATE INDEX IF NOT EXISTS idx_locations_asset_id ON locations(asset_id);
        CREATE INDEX IF NOT EXISTS idx_locations_filename ON locations(filename);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_normalized ON tags(name_normalized);
        CREATE INDEX IF NOT EXISTS idx_asset_tags_tag_id ON asset_tags(tag_id);
        CREATE INDEX IF NOT EXISTS idx_markers_asset_id ON markers(asset_id);
        INSERT OR IGNORE INTO settings (key, value, updated_at)
            VALUES ('thumbnail_generation_enabled', 'true', strftime('%s', 'now'));
    ").map_err(|e| crate::error::AppError::Database(e.to_string()))
}

fn migration_002_drive_media_types(conn: &Connection) -> Result<(), crate::error::AppError> {
    conn.execute_batch(
        "ALTER TABLE drives ADD COLUMN index_media_types TEXT NOT NULL DEFAULT 'video,image,audio';"
    ).map_err(|e| crate::error::AppError::Database(e.to_string()))
}

/// Migration 003 — transcripts table + FTS5 full-text search index.
/// Stores timestamped transcription segments per asset.
/// FTS5 enables full-text search across all transcript content.
fn migration_003_transcripts(conn: &Connection) -> Result<(), crate::error::AppError> {
    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS transcripts (
            id            TEXT PRIMARY KEY,
            asset_id      TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            engine        TEXT NOT NULL DEFAULT 'whisper.cpp',
            model         TEXT NOT NULL,
            language      TEXT,
            detected_lang TEXT,
            segments      TEXT NOT NULL,
            created_at    INTEGER NOT NULL,
            duration_ms   INTEGER
        );

        CREATE INDEX IF NOT EXISTS idx_transcripts_asset_id ON transcripts(asset_id);

        CREATE VIRTUAL TABLE IF NOT EXISTS transcript_fts USING fts5(
            asset_id UNINDEXED,
            text,
            content='transcripts',
            content_rowid='rowid',
            tokenize='porter ascii'
        );

        CREATE TRIGGER IF NOT EXISTS transcript_fts_insert
        AFTER INSERT ON transcripts BEGIN
            INSERT INTO transcript_fts(rowid, asset_id, text)
            VALUES (new.rowid, new.asset_id, new.segments);
        END;

        CREATE TRIGGER IF NOT EXISTS transcript_fts_delete
        AFTER DELETE ON transcripts BEGIN
            INSERT INTO transcript_fts(transcript_fts, rowid, asset_id, text)
            VALUES ('delete', old.rowid, old.asset_id, old.segments);
        END;

        CREATE TRIGGER IF NOT EXISTS transcript_fts_update
        AFTER UPDATE ON transcripts BEGIN
            INSERT INTO transcript_fts(transcript_fts, rowid, asset_id, text)
            VALUES ('delete', old.rowid, old.asset_id, old.segments);
            INSERT INTO transcript_fts(rowid, asset_id, text)
            VALUES (new.rowid, new.asset_id, new.segments);
        END;
    ").map_err(|e| crate::error::AppError::Database(e.to_string()))
}
