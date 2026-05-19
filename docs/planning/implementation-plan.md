# Implementation Plan — Media Asset Manager

> Version: 1.0
> Status: Draft
> Stage: 4 — Implementation Planning
> Last Updated: 2026-05-19

---

## 1. Overview

This plan covers the development of version 1.0.0 (MVP) of Media Asset Manager. Development is solo with AI-assisted tooling. All work is tracked against milestones and sprints defined below.

---

## 2. Milestone Plan

| Milestone | Description | Target Build |
|---|---|---|
| M1 | Project scaffolding — Tauri + React skeleton, SQLite connection, DB migrations | 0.1.0 |
| M2 | Drive registration and management | 0.2.0 |
| M3 | Background indexing engine — metadata extraction and fingerprinting | 0.3.0 |
| M4 | Library view — asset grid, search, filtering | 0.4.0 |
| M5 | Tagging system — create, apply, manage tags | 0.4.0 |
| M6 | Thumbnail generation — WebP, toggleable, per-index option | 0.5.0 |
| M7 | Asset detail view — metadata, locations, tags | 0.6.0 |
| M8 | Video playback and timeline scrubbing | 0.6.0 |
| M9 | Markers — point and clip markers, timeline display | 0.6.0 |
| M10 | Settings — library path, thumbnail default, statistics, purge | 0.7.0 |
| M11 | Orphaned asset handling and drive removal flow | 0.7.0 |
| M12 | Cross-platform testing and bug fixes | 0.8.0 |
| M13 | Release candidate — final polish and installer builds | 0.9.0 |
| M14 | Version 1.0.0 release | 1.0.0 |

---

## 3. Sprint Plan

Each sprint targets a working, testable increment. Sprints are time-boxed to approximately one week of focused development.

### Sprint 1 — Project Scaffolding (M1)
**Goal:** Working Tauri + React app shell with SQLite connected and migrations running.

Tasks:
- Initialize Tauri 2.x project with React + TypeScript
- Configure Tailwind CSS
- Set up SQLite via rusqlite with WAL mode
- Implement migration runner (schema_migrations table)
- Apply migration 001 — full initial schema
- Implement library root resolution (OS app data dir default)
- Implement app-level config file (active library path)
- Verify app launches on macOS, Windows, Linux
- Set up git branching workflow

**Done when:** App launches, SQLite connects, all tables created on first run.

---

### Sprint 2 — Drive Management (M2)
**Goal:** User can register, view, and remove drives. Real-time online/offline detection works.

Tasks:
- Implement Drive Manager component (Rust)
- Platform drive UUID resolution (macOS, Windows, Linux)
- Network share fingerprinting
- `drive_register` Tauri command
- `drive_list` Tauri command
- `drive_remove` and `drive_remove_confirm` Tauri commands
- `drive_rename` Tauri command
- Drive watcher using notify crate
- Emit `drive:connected` and `drive:disconnected` events
- driveStore Zustand store
- Drive management UI (list, register dialog, remove confirmation)
- Online/offline status indicator

**Done when:** User can register a drive, see it listed with status, and remove it. Status updates in real time when drive is connected/disconnected.

---

### Sprint 3 — Indexing Engine (M3)
**Goal:** Background indexing works end-to-end. Metadata extracted. Fingerprints computed and stored. Duplicate detection works.

Tasks:
- Implement Indexer component (Rust, Tokio background task)
- Directory walker with file extension filtering
- Implement Hasher component — SHA256 partial hash for all files
- Implement Metadata Extractor — FFmpeg sidecar integration
- Download and bundle FFmpeg static binaries for all platforms
- Extract video metadata (duration, codec, frame rate, resolution)
- Extract audio metadata (duration, codec, sample rate)
- Extract image metadata (dimensions)
- Duplicate detection — fingerprint DB query
- Insert asset + location records
- Incremental re-index logic (skip unchanged files)
- `index_start` Tauri command (with serialization guard)
- `index_cancel` Tauri command
- `index_status` Tauri command
- Emit indexing progress events
- indexingStore Zustand store
- Indexing progress UI (progress bar, file counts, cancel button)
- Indexing confirmation dialog (drive name + thumbnail checkbox)

**Done when:** Indexing a drive populates the database with assets and locations. Duplicate files on different drives are detected and merged. Progress is visible. Cancellation works cleanly.

---

### Sprint 4 — Library View, Search, and Tagging (M4, M5)
**Goal:** User can browse, search, filter, and tag assets.

Tasks:
- `asset_search` Tauri command with all filter combinations
- `asset_get` Tauri command
- libraryStore Zustand store
- Library grid view — asset cards with thumbnail placeholder
- Search bar (Enter / button trigger)
- Filter panel — media type, tag picker, date range, drive, status
- Sort controls
- Pagination
- `tag_create`, `tag_apply`, `tag_remove` Tauri commands
- `tag_list`, `tag_rename`, `tag_delete` Tauri commands
- Tag management screen
- Inline tag picker on asset card / detail view

**Done when:** User can browse all assets, search by filename, filter by type/tag/date/drive/status, and manage tags.

---

### Sprint 5 — Thumbnail Generation (M6)
**Goal:** Thumbnail generation works. WebP files generated and displayed. Toggle works.

Tasks:
- Implement Thumbnail Generator component (Rust, Tokio task)
- FFmpeg frame extraction at 10% duration for video
- FFmpeg WebP resize for images
- Save to thumbnails/ directory with relative path in DB
- Emit thumbnails:progress events
- Global thumbnail setting in settings table
- Per-index override via confirmation dialog checkbox
- Thumbnail display in asset grid
- Placeholder display when thumbnail unavailable
- `settings_purge_thumbnails` command

**Done when:** Thumbnails generate after indexing when enabled. Toggle in settings and per-index dialog both work. Purge removes all thumbnail files.

---

### Sprint 6 — Asset Detail View, Playback, and Markers (M7, M8, M9)
**Goal:** Full asset detail view with video playback and marker creation.

Tasks:
- Asset detail view layout
- Full metadata display
- Location list with drive status
- Tags display and inline edit
- Orphaned/missing file indicators
- `asset_open` and `asset_reveal` commands
- HTML5 video player component
- Play/pause controls
- Timeline scrubber
- Current time / duration display
- Webview format detection — show external player fallback for unsupported formats
- `marker_create` Tauri command (point and clip)
- `marker_update` Tauri command
- `marker_delete` Tauri command
- Marker list in detail view
- Marker indicators on video timeline
- Click marker to seek

**Done when:** User can open an asset, see all metadata and locations, play supported video formats, scrub the timeline, create named point and clip markers, and manage markers.

---

### Sprint 7 — Settings, Orphaned Assets, Drive Removal (M10, M11)
**Goal:** Settings screen complete. Orphaned asset flow complete. Drive removal prompt works.

Tasks:
- Settings screen layout
- Library location setting (browse + change path)
- Thumbnail global default toggle
- `settings_get_library_stats` command
- Library statistics display
- `settings_delete_orphaned_assets` command
- Bulk delete orphaned assets UI
- Drive removal orphan count and prompt
- `asset_delete` command
- Manual orphaned asset deletion from detail view
- Filter by orphaned/missing status in library view

**Done when:** Settings screen is complete. Drive removal correctly identifies orphaned assets and prompts user. Orphaned assets can be deleted individually or in bulk.

---

### Sprint 8 — Cross-Platform Testing (M12)
**Goal:** App runs correctly on all three platforms. Known platform differences documented.

Tasks:
- Full test run on macOS (Apple Silicon + Intel)
- Full test run on Windows 10/11
- Full test run on Ubuntu 22.04
- File path normalization verification
- Drive UUID resolution verification per platform
- WebP thumbnail rendering verification per platform
- Video playback format verification per platform
- notify crate event testing per platform
- FFmpeg sidecar execution verification per platform
- Bug fixes from cross-platform testing

**Done when:** App passes all core workflows on all three platforms without errors.

---

### Sprint 9 — Release Candidate (M13)
**Goal:** Polished, installable app ready for release.

Tasks:
- UI polish and consistency pass
- Error message review — all errors human-readable
- Performance testing — search on 100K asset library
- Installer builds — .dmg, .msi, .deb, .AppImage
- README update with installation and usage instructions
- CHANGELOG update for 1.0.0
- Final bug fixes

**Done when:** Installers build cleanly on all platforms. App installs and runs from installer. No known critical bugs.

---

## 4. Dependency Map

```
Sprint 1 (Scaffolding)
    │
    ├── Sprint 2 (Drive Management)
    │       │
    │       └── Sprint 3 (Indexing Engine)
    │               │
    │               ├── Sprint 4 (Library View + Tagging)
    │               │       │
    │               │       └── Sprint 5 (Thumbnails)
    │               │               │
    │               │               └── Sprint 6 (Detail View + Playback + Markers)
    │               │                       │
    │               │                       └── Sprint 7 (Settings + Orphaned Assets)
    │               │                               │
    │               │                               └── Sprint 8 (Cross-Platform Testing)
    │               │                                       │
    │               │                                       └── Sprint 9 (Release Candidate)
    │               │
    │               └── Sprint 3 also unblocks Sprint 5 (FFmpeg already integrated)
```

---

## 5. Complexity Estimates

| Sprint | Complexity | Primary Risk |
|---|---|---|
| 1 — Scaffolding | Low | Tauri + React setup friction |
| 2 — Drive Management | Medium | Platform UUID APIs differ |
| 3 — Indexing Engine | High | FFmpeg sidecar integration; async Rust complexity |
| 4 — Library + Tagging | Medium | Search query performance at scale |
| 5 — Thumbnails | Medium | FFmpeg WebP output; per-index toggle wiring |
| 6 — Detail + Playback + Markers | High | Video player + timeline + marker overlay complexity |
| 7 — Settings + Orphaned | Low-Medium | Orphan detection edge cases |
| 8 — Cross-Platform | Medium | Platform-specific bugs are hard to predict |
| 9 — Release Candidate | Low | Polish and packaging |

**Highest risk sprints:** Sprint 3 (FFmpeg + async Rust) and Sprint 6 (video player + markers). Both should be started with a proof-of-concept before full implementation.

---

## 6. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft created during SDLC Stage 4 |
