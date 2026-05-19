# Data Model — Media Asset Manager

> Version: 1.0
> Status: Draft
> Stage: 3 — Architecture & Technical Design
> Last Updated: 2026-05-19

---

## 1. Overview

The database is a single SQLite file (`library.db`) stored in the library root directory. WAL mode is enabled. The schema is versioned and supports forward migrations.

All timestamps are stored as Unix epoch integers (seconds). All UUIDs are stored as TEXT. File paths stored in the database are normalized to forward-slash format and are either absolute (for drive paths) or relative (for thumbnail paths).

---

## 2. Entity Relationship Diagram

```
drives ──────────────── locations ──────────────── assets
  │                         │                         │
  │ 1                       │ N                       │ 1
  │                         │                         │
  └── drive_id              └── asset_id              └── asset_id
                                                            │
                                                    ┌───────┴────────┐
                                                    │                │
                                               asset_tags        markers
                                                    │
                                                   tags
```

---

## 3. Table Definitions

### 3.1 `drives`
Registered media sources (external drives, folders, network shares).

```sql
CREATE TABLE drives (
    id              TEXT PRIMARY KEY,        -- UUID, generated at registration
    friendly_name   TEXT NOT NULL,           -- User-assigned name
    platform_uuid   TEXT NOT NULL UNIQUE,    -- OS-level drive identifier
    drive_type      TEXT NOT NULL,           -- 'local' | 'network'
    root_path       TEXT NOT NULL,           -- Last known mount path
    is_online       INTEGER NOT NULL DEFAULT 0, -- 0 = offline, 1 = online
    registered_at   INTEGER NOT NULL,        -- Unix timestamp
    last_seen_at    INTEGER                  -- Unix timestamp, nullable
);
```

---

### 3.2 `assets`
One record per unique media file, identified by content fingerprint.

```sql
CREATE TABLE assets (
    id              TEXT PRIMARY KEY,        -- UUID, generated at index time
    fingerprint     TEXT NOT NULL UNIQUE,    -- SHA256 partial hash
    media_type      TEXT NOT NULL,           -- 'video' | 'image' | 'audio'
    file_extension  TEXT NOT NULL,           -- Lowercase, e.g. 'mp4', 'jpg'
    file_size       INTEGER NOT NULL,        -- Bytes
    duration_ms     INTEGER,                 -- Milliseconds, video/audio only
    width           INTEGER,                 -- Pixels, video/image only
    height          INTEGER,                 -- Pixels, video/image only
    codec           TEXT,                    -- e.g. 'h264', 'hevc', 'aac'
    frame_rate      REAL,                    -- FPS, video only
    sample_rate     INTEGER,                 -- Hz, audio only
    created_at_fs   INTEGER,                 -- File creation date (from filesystem)
    modified_at_fs  INTEGER,                 -- File modification date (from filesystem)
    thumbnail_path  TEXT,                    -- Relative path e.g. 'thumbnails/uuid.jpg'
    is_orphaned     INTEGER NOT NULL DEFAULT 0, -- 1 = no remaining locations
    indexed_at      INTEGER NOT NULL,        -- Unix timestamp
    updated_at      INTEGER NOT NULL         -- Unix timestamp
);
```

---

### 3.3 `locations`
One or more file path records per asset. Represents all known locations of a file.

```sql
CREATE TABLE locations (
    id              TEXT PRIMARY KEY,        -- UUID
    asset_id        TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    drive_id        TEXT NOT NULL REFERENCES drives(id) ON DELETE CASCADE,
    file_path       TEXT NOT NULL,           -- Full path on this drive
    filename        TEXT NOT NULL,           -- Filename component only
    is_missing      INTEGER NOT NULL DEFAULT 0, -- 1 = not found on last re-index
    first_seen_at   INTEGER NOT NULL,        -- Unix timestamp
    last_seen_at    INTEGER NOT NULL         -- Unix timestamp
);

CREATE UNIQUE INDEX idx_locations_asset_drive_path
    ON locations(asset_id, drive_id, file_path);
```

---

### 3.4 `tags`
Global tag registry. Tags are stored in normalized (lowercase, trimmed) form.

```sql
CREATE TABLE tags (
    id              TEXT PRIMARY KEY,        -- UUID
    name_normalized TEXT NOT NULL UNIQUE,    -- Lowercase, trimmed — used for dedup
    name_display    TEXT NOT NULL,           -- Original casing as entered by user
    created_at      INTEGER NOT NULL         -- Unix timestamp
);
```

---

### 3.5 `asset_tags`
Junction table linking assets to tags. Many-to-many.

```sql
CREATE TABLE asset_tags (
    asset_id        TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    tag_id          TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    tagged_at       INTEGER NOT NULL,        -- Unix timestamp
    PRIMARY KEY (asset_id, tag_id)
);
```

---

### 3.6 `markers`
Named time markers on video assets. Supports single-point and in/out clip markers.

```sql
CREATE TABLE markers (
    id              TEXT PRIMARY KEY,        -- UUID
    asset_id        TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,           -- User-defined name
    marker_type     TEXT NOT NULL,           -- 'point' | 'clip'
    position_ms     INTEGER NOT NULL,        -- Start position in milliseconds
    end_position_ms INTEGER,                 -- End position for 'clip' type, NULL for 'point'
    created_at      INTEGER NOT NULL,        -- Unix timestamp
    updated_at      INTEGER NOT NULL         -- Unix timestamp
);

CREATE INDEX idx_markers_asset_id ON markers(asset_id);
```

---

### 3.7 `schema_migrations`
Tracks applied database migrations.

```sql
CREATE TABLE schema_migrations (
    version         INTEGER PRIMARY KEY,     -- Migration version number
    applied_at      INTEGER NOT NULL,        -- Unix timestamp
    description     TEXT NOT NULL            -- Human-readable description
);
```

---

### 3.8 `settings`
Key-value store for user preferences and app configuration.

```sql
CREATE TABLE settings (
    key             TEXT PRIMARY KEY,
    value           TEXT NOT NULL,
    updated_at      INTEGER NOT NULL
);
```

**Default settings keys:**

| Key | Default | Description |
|---|---|---|
| `thumbnail_generation_enabled` | `true` | Global thumbnail default |
| `library_version` | `1` | Schema version reference |

---

## 4. Indexes

```sql
-- Asset lookup by fingerprint (duplicate detection)
CREATE UNIQUE INDEX idx_assets_fingerprint ON assets(fingerprint);

-- Asset filtering by media type
CREATE INDEX idx_assets_media_type ON assets(media_type);

-- Asset filtering by creation date
CREATE INDEX idx_assets_created_at_fs ON assets(created_at_fs);

-- Asset filtering by orphan status
CREATE INDEX idx_assets_is_orphaned ON assets(is_orphaned);

-- Location lookup by drive (used when drive is removed)
CREATE INDEX idx_locations_drive_id ON locations(drive_id);

-- Location lookup by asset (used in detail view)
CREATE INDEX idx_locations_asset_id ON locations(asset_id);

-- Tag lookup by normalized name (dedup on create)
CREATE UNIQUE INDEX idx_tags_name_normalized ON tags(name_normalized);

-- Asset tag lookup by tag (used in tag filtering)
CREATE INDEX idx_asset_tags_tag_id ON asset_tags(tag_id);

-- Filename search (used in search queries)
CREATE INDEX idx_locations_filename ON locations(filename);

-- Marker lookup by asset
CREATE INDEX idx_markers_asset_id ON markers(asset_id);
```

---

## 5. Key Data Flows

### 5.1 Indexing a New File
1. Compute file size
2. Query: any existing asset with same file size?
3. If yes: compute fingerprint; query: any existing asset with same fingerprint?
4. If fingerprint match: insert new `locations` record for existing asset
5. If no match: insert new `assets` record + new `locations` record
6. If thumbnail enabled: queue thumbnail generation job

### 5.2 Tag Normalization
- On tag create or apply: normalize input to lowercase, trimmed
- Query `tags` by `name_normalized`
- If exists: use existing tag ID
- If not: insert new tag with `name_normalized` and `name_display` as entered

### 5.3 Drive Removal
1. Query all `locations` for this `drive_id`
2. Identify `asset_id` values that would have no remaining locations after deletion
3. Present count to user; user chooses keep or delete
4. If delete: `DELETE FROM assets WHERE id IN (orphaned_ids)` — CASCADE removes locations, tags, markers
5. `DELETE FROM locations WHERE drive_id = ?`
6. Update remaining assets with no locations: `UPDATE assets SET is_orphaned = 1`
7. `DELETE FROM drives WHERE id = ?`

### 5.4 Orphan Detection
- After any location deletion, check: `SELECT COUNT(*) FROM locations WHERE asset_id = ?`
- If count = 0: `UPDATE assets SET is_orphaned = 1 WHERE id = ?`

---

## 6. Migration Strategy

- Migrations are numbered sequentially: `001`, `002`, etc.
- Each migration is a Rust function that executes SQL and inserts a row into `schema_migrations`
- On app startup, the migration runner checks the current schema version and applies any pending migrations in order
- Migrations are append-only — existing migrations are never modified
- Breaking schema changes require a new migration, never an in-place edit

---

## 7. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft created during SDLC Stage 3 |
