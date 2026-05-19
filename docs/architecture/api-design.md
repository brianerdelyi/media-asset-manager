# API Design — Media Asset Manager

> Version: 1.1
> Status: Revised
> Stage: 3 — Architecture & Technical Design
> Last Updated: 2026-05-19
> Change: Updated thumbnail_path references from .jpg to .webp. Added INDEXING_IN_PROGRESS handling note to index_start command.

---

## 1. Overview

This document defines the internal API between the React frontend and the Rust backend via Tauri's command and event system. This is not a network API — all communication is local inter-process communication (IPC) within the Tauri application.

All commands are invoked using Tauri's `invoke()` function from the frontend. All events are emitted from the Rust backend and received via Tauri's `listen()` function on the frontend.

---

## 2. Conventions

### 2.1 Command Naming
- Snake case: `get_assets`, `register_drive`, `create_marker`
- Prefixed by domain: `drive_*`, `asset_*`, `tag_*`, `marker_*`, `index_*`, `settings_*`

### 2.2 Response Format
All commands return a Rust `Result<T, AppError>` serialized as:

**Success:**
```json
{ "data": { ... } }
```

**Error:**
```json
{
  "error": {
    "code": "DRIVE_NOT_FOUND",
    "message": "The specified drive could not be found."
  }
}
```

### 2.3 Timestamps
All timestamps in command responses are Unix epoch integers (seconds).

### 2.4 Pagination
Commands returning lists support optional pagination:
```json
{ "page": 1, "page_size": 50 }
```
Responses include:
```json
{ "data": [...], "total": 1240, "page": 1, "page_size": 50 }
```

---

## 3. Drive Commands

### `drive_register`
Register a new media source.

**Input:**
```json
{
  "path": "/Volumes/FootageDrive",
  "friendly_name": "Footage Drive 01"
}
```
**Output:**
```json
{
  "id": "uuid",
  "friendly_name": "Footage Drive 01",
  "platform_uuid": "abc-123",
  "drive_type": "local",
  "root_path": "/Volumes/FootageDrive",
  "is_online": true,
  "registered_at": 1716124800
}
```

---

### `drive_list`
Get all registered drives with current status.

**Input:** none

**Output:**
```json
[
  {
    "id": "uuid",
    "friendly_name": "Footage Drive 01",
    "is_online": true,
    "asset_count": 1240,
    "location_count": 1350,
    "registered_at": 1716124800,
    "last_seen_at": 1716124900
  }
]
```

---

### `drive_remove`
Remove a registered drive. Returns orphan preview before deletion.

**Input:**
```json
{ "drive_id": "uuid" }
```
**Output:**
```json
{
  "orphaned_asset_count": 42,
  "affected_asset_count": 150,
  "requires_confirmation": true
}
```
Frontend shows confirmation dialog. User confirms with `drive_remove_confirm`.

---

### `drive_remove_confirm`
Execute drive removal after user confirmation.

**Input:**
```json
{
  "drive_id": "uuid",
  "delete_orphaned_assets": true
}
```
**Output:**
```json
{
  "removed_locations": 150,
  "deleted_assets": 42,
  "orphaned_assets": 0
}
```

---

### `drive_rename`
Update the friendly name of a registered drive.

**Input:**
```json
{ "drive_id": "uuid", "friendly_name": "New Name" }
```
**Output:** Updated drive record.

---

## 4. Indexing Commands

### `index_start`
Start indexing a registered drive. Only one indexing job may run at a time. Returns `INDEXING_IN_PROGRESS` error if a job is already running.

**Input:**
```json
{
  "drive_id": "uuid",
  "generate_thumbnails": true,
  "incremental": true
}
```
**Output:**
```json
{ "job_id": "uuid" }
```
**Error (if job already running):**
```json
{
  "error": {
    "code": "INDEXING_IN_PROGRESS",
    "message": "Indexing is already in progress on [Drive Name]. Please wait or cancel the current job."
  }
}
```

---

### `index_cancel`
Cancel an in-progress indexing job.

**Input:**
```json
{ "job_id": "uuid" }
```
**Output:**
```json
{ "cancelled": true }
```

---

### `index_status`
Get the current status of an indexing job.

**Input:**
```json
{ "job_id": "uuid" }
```
**Output:**
```json
{
  "job_id": "uuid",
  "drive_id": "uuid",
  "status": "running",
  "files_found": 1500,
  "files_indexed": 742,
  "files_skipped": 10,
  "percent_complete": 49,
  "started_at": 1716124800
}
```

---

## 5. Asset Commands

### `asset_search`
Search and filter the asset index.

**Input:**
```json
{
  "query": "beach",
  "filters": {
    "media_types": ["video", "image"],
    "tag_ids": ["uuid1", "uuid2"],
    "drive_ids": ["uuid"],
    "date_from": 1700000000,
    "date_to": 1716124800,
    "has_markers": false,
    "status": "all"
  },
  "sort": { "field": "created_at_fs", "direction": "desc" },
  "page": 1,
  "page_size": 50
}
```

**Status values:** `"all"` | `"orphaned"` | `"missing"`

**Output:**
```json
{
  "data": [
    {
      "id": "uuid",
      "media_type": "video",
      "file_extension": "mp4",
      "filename": "beach_shoot_001.mp4",
      "file_size": 2500000000,
      "duration_ms": 125000,
      "width": 3840,
      "height": 2160,
      "created_at_fs": 1700000000,
      "thumbnail_path": "thumbnails/uuid.webp",
      "is_orphaned": false,
      "primary_drive_name": "Footage Drive 01",
      "primary_drive_online": true,
      "location_count": 2,
      "tag_count": 3,
      "marker_count": 2
    }
  ],
  "total": 240,
  "page": 1,
  "page_size": 50
}
```

---

### `asset_get`
Get full detail for a single asset including locations, tags, and markers.

**Input:**
```json
{ "asset_id": "uuid" }
```

**Output:**
```json
{
  "id": "uuid",
  "media_type": "video",
  "file_extension": "mp4",
  "file_size": 2500000000,
  "duration_ms": 125000,
  "width": 3840,
  "height": 2160,
  "codec": "h264",
  "frame_rate": 29.97,
  "created_at_fs": 1700000000,
  "modified_at_fs": 1700000100,
  "thumbnail_path": "thumbnails/uuid.webp",
  "is_orphaned": false,
  "locations": [
    {
      "id": "uuid",
      "drive_id": "uuid",
      "drive_name": "Footage Drive 01",
      "is_online": true,
      "file_path": "/Volumes/FootageDrive/Projects/Beach/beach_001.mp4",
      "filename": "beach_001.mp4",
      "is_missing": false,
      "last_seen_at": 1716124800
    }
  ],
  "tags": [
    { "id": "uuid", "name_display": "b-roll", "name_normalized": "b-roll" }
  ],
  "markers": [
    {
      "id": "uuid",
      "name": "Best wave",
      "marker_type": "point",
      "position_ms": 45200,
      "end_position_ms": null
    },
    {
      "id": "uuid",
      "name": "Hero shot",
      "marker_type": "clip",
      "position_ms": 61000,
      "end_position_ms": 74500
    }
  ]
}
```

---

### `asset_open`
Open an asset with the OS default application.

**Input:**
```json
{ "asset_id": "uuid", "location_id": "uuid" }
```
**Output:**
```json
{ "opened": true }
```

---

### `asset_reveal`
Reveal an asset in the OS file manager.

**Input:**
```json
{ "asset_id": "uuid", "location_id": "uuid" }
```
**Output:**
```json
{ "revealed": true }
```

---

### `asset_delete`
Delete an asset record and all associated data.

**Input:**
```json
{ "asset_id": "uuid" }
```
**Output:**
```json
{ "deleted": true }
```

---

## 6. Tag Commands

### `tag_list`
Get all tags with asset counts.

**Input:** none

**Output:**
```json
[
  {
    "id": "uuid",
    "name_display": "b-roll",
    "name_normalized": "b-roll",
    "asset_count": 142,
    "created_at": 1716124800
  }
]
```

---

### `tag_create`
Create a new tag.

**Input:**
```json
{ "name": "Summer Campaign" }
```
**Output:** Tag record. If tag with same normalized name exists, returns existing tag.

---

### `tag_apply`
Apply a tag to an asset.

**Input:**
```json
{ "asset_id": "uuid", "tag_id": "uuid" }
```
**Output:**
```json
{ "applied": true }
```

---

### `tag_remove`
Remove a tag from an asset.

**Input:**
```json
{ "asset_id": "uuid", "tag_id": "uuid" }
```
**Output:**
```json
{ "removed": true }
```

---

### `tag_rename`
Rename a tag globally.

**Input:**
```json
{ "tag_id": "uuid", "name": "New Name" }
```
**Output:** Updated tag record.

---

### `tag_delete`
Delete a tag and remove it from all assets.

**Input:**
```json
{ "tag_id": "uuid" }
```
**Output:**
```json
{ "deleted": true, "removed_from_assets": 42 }
```

---

## 7. Marker Commands

### `marker_create`
Create a new marker on a video asset.

**Input:**
```json
{
  "asset_id": "uuid",
  "name": "Best take",
  "marker_type": "point",
  "position_ms": 45200,
  "end_position_ms": null
}
```
For clip markers, provide both `position_ms` (in point) and `end_position_ms` (out point).

**Output:** Marker record.

---

### `marker_update`
Update a marker name.

**Input:**
```json
{ "marker_id": "uuid", "name": "Updated name" }
```
**Output:** Updated marker record.

---

### `marker_delete`
Delete a marker.

**Input:**
```json
{ "marker_id": "uuid" }
```
**Output:**
```json
{ "deleted": true }
```

---

## 8. Settings Commands

### `settings_get`
Get all settings.

**Input:** none

**Output:**
```json
{
  "thumbnail_generation_enabled": true,
  "library_path": "/Users/brian/Library/Application Support/media-asset-manager"
}
```

---

### `settings_set`
Update a setting.

**Input:**
```json
{ "key": "thumbnail_generation_enabled", "value": "false" }
```
**Output:**
```json
{ "updated": true }
```

---

### `settings_get_library_stats`
Get library statistics.

**Input:** none

**Output:**
```json
{
  "total_assets": 4820,
  "total_drives": 6,
  "total_locations": 5100,
  "orphaned_assets": 12,
  "missing_files": 3,
  "database_size_bytes": 52428800,
  "thumbnails_size_bytes": 72351744,
  "thumbnails_count": 4200
}
```

---

### `settings_purge_thumbnails`
Delete all thumbnail files.

**Input:** none

**Output:**
```json
{ "deleted_count": 4200, "freed_bytes": 72351744 }
```

---

### `settings_delete_orphaned_assets`
Bulk delete all orphaned assets.

**Input:** none

**Output:**
```json
{ "deleted_count": 12 }
```

---

## 9. Tauri Events (Backend → Frontend)

| Event | Payload | Description |
|---|---|---|
| `drive:connected` | `{ drive_id, friendly_name }` | A registered drive came online |
| `drive:disconnected` | `{ drive_id, friendly_name }` | A registered drive went offline |
| `indexing:started` | `{ job_id, drive_id }` | Indexing job started |
| `indexing:progress` | `{ job_id, files_found, files_indexed, files_skipped, percent_complete }` | Progress update |
| `indexing:complete` | `{ job_id, total_indexed, total_skipped, duration_ms }` | Indexing finished |
| `indexing:cancelled` | `{ job_id }` | Indexing was cancelled |
| `indexing:error` | `{ job_id, error }` | Indexing failed |
| `thumbnails:progress` | `{ job_id, completed, total }` | Thumbnail generation progress |
| `thumbnails:complete` | `{ job_id, generated, skipped }` | Thumbnail generation finished |

---

## 10. Error Codes

| Code | Description |
|---|---|
| `DRIVE_NOT_FOUND` | Drive ID does not exist in database |
| `DRIVE_OFFLINE` | Operation requires drive to be online |
| `ASSET_NOT_FOUND` | Asset ID does not exist |
| `TAG_NOT_FOUND` | Tag ID does not exist |
| `MARKER_NOT_FOUND` | Marker ID does not exist |
| `INDEXING_IN_PROGRESS` | Cannot start indexing while another job is running |
| `INDEXING_NOT_FOUND` | Job ID does not exist |
| `DATABASE_ERROR` | SQLite operation failed |
| `FILESYSTEM_ERROR` | File system operation failed |
| `FFMPEG_NOT_FOUND` | FFmpeg sidecar binary not found |
| `FFMPEG_ERROR` | FFmpeg execution failed |
| `INVALID_PARAMETERS` | Input validation failed |

---

## 11. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Updated thumbnail_path in asset_search and asset_get responses from .jpg to .webp. Added INDEXING_IN_PROGRESS error response to index_start command. Updated thumbnails_size_bytes estimates to reflect WebP file sizes. |
