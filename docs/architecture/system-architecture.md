# System Architecture — Media Asset Manager

> Version: 1.1
> Status: Revised
> Stage: 3 — Architecture & Technical Design
> Last Updated: 2026-05-19
> Change: Updated thumbnail format to WebP. Updated FFmpeg sidecar strategy with version pinning and sources. Added serialized indexing constraint. Updated scalability section.

---

## 1. Architecture Overview

Media Asset Manager is a local-first, offline-capable desktop application built on Tauri 2.x. It follows a clean two-layer architecture: a Rust backend that owns all system-level operations, and a React frontend that owns all UI rendering. The two layers communicate exclusively through Tauri's typed command and event system.

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│         (TypeScript, React 18, Tailwind CSS)            │
│                                                         │
│  Library View │ Detail View │ Player │ Search │ Settings│
└────────────────────────┬────────────────────────────────┘
                         │ Tauri Commands & Events
┌────────────────────────┴────────────────────────────────┐
│                    Rust Backend                          │
│                   (Tauri 2.x Core)                      │
│                                                         │
│  Indexer │ FileSystem │ DriveWatcher │ Hasher │ Metadata│
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
   ┌──────┴──────┐             ┌────────┴───────┐
   │  SQLite DB  │             │  Thumbnails    │
   │ library.db  │             │   /thumbnails/ │
   └─────────────┘             └────────────────┘
```

---

## 2. Layer Responsibilities

### 2.1 React Frontend
- All UI rendering and user interaction
- State management via Zustand
- Calls Tauri commands for all data operations
- Listens to Tauri events for real-time updates (drive status, indexing progress)
- Never accesses the filesystem or database directly
- Renders video via HTML5 `<video>` element

### 2.2 Rust Backend
- All filesystem access and drive operations
- SQLite database reads and writes via `rusqlite`
- Drive mount/unmount detection via `notify` crate
- File indexing, metadata extraction, fingerprint computation
- Thumbnail generation via FFmpeg sidecar
- Background task management via Tokio async runtime
- Exposes functionality to frontend via Tauri commands

### 2.3 SQLite Database
- Single file: `library.db` in the library root directory
- WAL mode enabled for crash safety
- Versioned schema with migration support
- Stores: assets, locations, tags, markers, drives, settings

### 2.4 Thumbnails Directory
- Subfolder `thumbnails/` co-located with `library.db`
- Named by asset UUID: `{asset_uuid}.webp`
- Referenced by relative path in database
- Resolved to absolute path at runtime using library root

---

## 3. Core Components

### 3.1 Drive Manager
**Responsibility:** Register, track, and monitor media sources.

- Stores drive records in SQLite with platform UUID
- Uses `notify` crate to watch for volume mount/unmount events
- Emits `drive:connected` and `drive:disconnected` Tauri events to frontend
- Resolves platform-specific drive identifiers at registration time

### 3.2 Indexer
**Responsibility:** Scan registered drives and populate the asset index.

- Runs on a Tokio background thread — never blocks UI
- Only one indexing job runs at a time — jobs are serialized
- If a job is already running, new requests return `INDEXING_IN_PROGRESS` error
- Walks directory tree, filtering by supported file extensions
- Calls Metadata Extractor for each file
- Calls Hasher to compute content fingerprint
- Checks database for existing asset with matching fingerprint
- Creates new asset record or adds location record as appropriate
- Emits `indexing:progress` events to frontend
- Supports cancellation via async cancellation token
- Supports incremental mode: skips files with unchanged size and modification date

### 3.3 Metadata Extractor
**Responsibility:** Extract technical metadata from media files.

- Uses FFmpeg sidecar (bundled with app) for video and audio metadata
- Uses image crate or FFmpeg for image metadata
- Returns structured metadata: duration, resolution, codec, frame rate, sample rate, creation date
- Handles extraction failures gracefully — indexes file with available metadata only

### 3.4 Hasher
**Responsibility:** Compute content fingerprint for duplicate detection.

- For files > 128KB: SHA256 of first 64KB + last 64KB
- For files ≤ 128KB: SHA256 of entire file
- File size used as pre-filter before hashing
- Returns hex string stored in asset record

### 3.5 Thumbnail Generator
**Responsibility:** Generate and store thumbnail images.

- Runs after indexing completes on a separate Tokio task
- Video: uses FFmpeg to extract frame at 10% of duration, output as WebP
- Image: resizes and converts to WebP using FFmpeg
- Fixed settings: 320px longest edge, WebP lossy quality 75
- Saves to `thumbnails/{asset_uuid}.webp`
- Stores relative path `thumbnails/{asset_uuid}.webp` in database
- Respects per-index enable/disable flag passed from frontend
- Emits `thumbnails:progress` events to frontend

### 3.6 Search Engine
**Responsibility:** Query the asset index and return filtered results.

- All queries run against SQLite
- Supports: filename partial match (LIKE), tag filter (JOIN), media type filter, date range filter, drive filter, marker presence filter, status filter (orphaned, missing)
- Returns paginated result sets to avoid large memory allocations
- All queries work regardless of drive online/offline status

### 3.7 Library Manager
**Responsibility:** Manage library root location and app-level configuration.

- Reads/writes app-level config file in OS app data directory
- Config stores: active library path, recent library paths (future)
- Initializes new library: creates `library.db`, `thumbnails/` directory
- Handles library path changes (takes effect on restart)

---

## 4. Communication Architecture

### 4.1 Tauri Commands (Frontend → Backend)
Synchronous or async request/response. Used for data queries and user-initiated actions.

Examples:
- `get_assets(filters)` → returns asset list
- `get_asset_detail(asset_id)` → returns full asset with locations, tags, markers
- `register_drive(path, name)` → registers a new media source
- `start_indexing(drive_id, options)` → begins background indexing
- `cancel_indexing(job_id)` → cancels in-progress indexing
- `create_marker(asset_id, marker_data)` → creates a marker
- `search_assets(query, filters)` → returns search results

### 4.2 Tauri Events (Backend → Frontend)
Asynchronous push notifications. Used for real-time updates.

Examples:
- `drive:connected { drive_id }` → drive came online
- `drive:disconnected { drive_id }` → drive went offline
- `indexing:progress { job_id, files_found, files_indexed, percent }` → progress update
- `indexing:complete { job_id, stats }` → indexing finished
- `indexing:cancelled { job_id }` → indexing was cancelled
- `thumbnails:progress { job_id, completed, total }` → thumbnail generation progress

---

## 5. State Management (Frontend)

Zustand stores, each with a single responsibility:

| Store | Responsibility |
|---|---|
| `libraryStore` | Asset list, current filters, search query, sort order |
| `driveStore` | Registered drives, online/offline status |
| `indexingStore` | Active indexing jobs, progress state |
| `settingsStore` | User preferences, library path, thumbnail default |
| `uiStore` | Selected asset, open panels, modal state |

---

## 6. Background Task Architecture

All long-running operations run on Tauri's Tokio async runtime:

```
UI Thread (React/WebView)
    │
    │ invoke command
    ▼
Tauri Command Handler (Rust, async)
    │
    │ spawn task
    ▼
Tokio Background Task
    │
    │ emit events
    ▼
UI Thread receives events → updates Zustand store → React re-renders
```

Cancellation is handled via `tokio_util::sync::CancellationToken` passed into background tasks.

---

## 7. FFmpeg Sidecar Strategy

FFmpeg is bundled as a platform-specific static binary sidecar. Static builds have no runtime dependencies and behave consistently across all user machines.

### Version Strategy
- Pin to latest stable FFmpeg release at build time (e.g. `7.1`)
- Document pinned version in project
- Update FFmpeg version deliberately with each app release — never automatically
- Test new FFmpeg version before shipping

### Trusted Static Build Sources

| Platform | Source |
|---|---|
| macOS (x86_64) | evermeet.cx/ffmpeg |
| macOS (ARM64) | evermeet.cx/ffmpeg |
| Windows (x86_64) | gyan.dev/ffmpeg/builds — "release essentials" build |
| Linux (x86_64) | johnvansickle.com/ffmpeg — static builds |

### Binary Naming Convention

| Platform | Binary name |
|---|---|
| macOS (x86_64) | `ffmpeg-macos-x86_64` |
| macOS (ARM64) | `ffmpeg-macos-arm64` |
| Windows | `ffmpeg-windows-x86_64.exe` |
| Linux | `ffmpeg-linux-x86_64` |

Tauri's sidecar API handles binary selection and execution. FFmpeg is called via command invocation — not linked as a library. This avoids GPL licensing complications.

### FFmpeg Usage

| Purpose | Notes |
|---|---|
| Video metadata extraction | duration, codec, frame rate, resolution |
| Audio metadata extraction | duration, codec, sample rate |
| Video thumbnail frame extraction | frame at 10% duration, output WebP |
| Image thumbnail generation | resize to 320px, output WebP |

### Installer Size
Using the "essentials" static build keeps the binary to approximately 50–70MB per platform. This is standard and expected for a media application.

---

## 8. Error Handling Strategy

### 8.1 Principles
- All Tauri commands return `Result<T, AppError>` — never panic in command handlers
- Frontend receives structured error responses with error code and human-readable message
- Background tasks log errors and emit error events; they do not crash the app
- File-level errors during indexing are logged and skipped — one bad file does not stop indexing

### 8.2 Error Categories

| Category | Handling |
|---|---|
| File not found | Log, mark as missing, continue |
| Metadata extraction failure | Log, index with available metadata, continue |
| Thumbnail generation failure | Log, store null path, show placeholder |
| Database error | Log, surface to user, halt operation |
| Drive not accessible | Mark offline, surface to user |
| FFmpeg not found | Surface to user with actionable message |
| Indexing already in progress | Return INDEXING_IN_PROGRESS error to frontend |

### 8.3 User-Facing Errors
- Errors are displayed in a non-blocking notification system
- Critical errors (database corruption, library not found) are shown as modal dialogs
- All errors include a suggested action where possible

---

## 9. Logging Strategy

- Rust backend: `tracing` crate with structured logging
- Log levels: ERROR, WARN, INFO, DEBUG
- Log output: rotating file in OS app data directory (`logs/app.log`)
- Sensitive data (file paths) included at DEBUG level only
- Frontend errors: captured and forwarded to Rust logger via Tauri command
- Log file location surfaced in Settings for user access

---

## 10. Security Architecture

- No network access — all operations are local
- No telemetry or analytics
- App only accesses filesystem paths the user has explicitly registered
- SQLite database has no password (local single-user app; OS filesystem permissions provide security)
- FFmpeg sidecar runs as child process with inherited permissions — no elevated privileges
- Tauri's built-in CSP (Content Security Policy) restricts frontend from making external network requests

---

## 11. Cross-Platform Considerations

| Concern | Approach |
|---|---|
| File paths | Normalize all paths using Rust's `std::path::PathBuf` at ingestion |
| Path separators | Store normalized forward-slash paths in DB; convert to OS-native at runtime |
| Drive identification | Platform-specific UUID resolution in dedicated module |
| App data directory | Resolved via Tauri's `app_data_dir()` API |
| Webview differences | Feature-detect video format support at runtime; show fallback as needed |
| File system events | `notify` crate abstracts OS-specific event APIs |
| Binary installers | Tauri bundler produces .dmg (macOS), .msi/.exe (Windows), .deb/.AppImage (Linux) |
| WebP thumbnails | Supported natively in all three platform webviews used by Tauri |

---

## 12. Scalability Considerations

| Concern | Approach |
|---|---|
| 100K+ assets | SQLite with proper indexes; paginated queries |
| Large video files | Partial hash (128KB read max regardless of file size) |
| Many drives | Drive status cached in memory; DB only queried on change |
| Concurrent indexing | Single serialized indexing job (MVP); queue-based concurrency in backlog |
| Thumbnail storage | One WebP per asset (~10–20KB avg); purge option available |
| Search performance | Compound indexes on frequently filtered columns |
| Storage at scale | 100K assets × ~15KB = ~1.5GB thumbnails; 500K assets × ~15KB = ~7.5GB |

---

## 13. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Updated thumbnail format from JPEG to WebP (320px, quality 75). Updated FFmpeg sidecar section with version pinning strategy, trusted sources, and installer size note. Added serialized indexing constraint to Indexer component. Added WebP support note to cross-platform section. Updated scalability storage estimates for WebP. |
