# Implementation Plan — Media Asset Manager

> Version: 1.1
> Status: Revised
> Stage: 4 — Implementation Planning
> Last Updated: 2026-05-19
> Change: Updated to macOS-first release strategy. Version 1.0.0 targets macOS only. Windows and Linux porting moved to backlog. Sprint 8 updated to macOS validation only. Sprint 9 updated to macOS release candidate only. FFmpeg bundling updated to macOS binaries only for 1.0.0.

---

## 1. Overview

This plan covers the development of version 1.0.0 (MVP) of Media Asset Manager. Version 1.0.0 targets **macOS only**. Windows and Linux porting will be planned as separate future releases after 1.0.0 ships. Development is solo with AI-assisted tooling.

Platform-specific code is written behind clean abstractions from the start to make future porting additive rather than requiring rewrites.

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
| M12 | macOS validation and bug fixes | 0.8.0 |
| M13 | macOS release candidate — final polish and .dmg installer | 0.9.0 |
| M14 | Version 1.0.0 macOS release | 1.0.0 |

---

## 3. Sprint Plan

Each sprint targets a working, testable increment on macOS. Sprints are time-boxed to approximately one week of focused development.

### Sprint 1 — Project Scaffolding (M1)
**Goal:** Working Tauri + React app shell with SQLite connected and migrations running on macOS.

Tasks:
- Initialize Tauri 2.x project with React + TypeScript
- Configure Tailwind CSS
- Set up SQLite via rusqlite with WAL mode
- Implement migration runner (schema_migrations table)
- Apply migration 001 — full initial schema
- Implement library root resolution (macOS app data dir default)
- Implement app-level config file (active library path)
- Verify app launches on macOS (Apple Silicon + Intel)
- Set up git branching workflow
- Implement platform abstraction module (`drives/platform.rs`) with macOS implementation and stubbed Windows/Linux branches

**Done when:** App launches on macOS, SQLite connects, all tables created on first run.

---

### Sprint 2 — Drive Management (M2)
**Goal:** User can register, view, and remove drives on macOS. Real-time online/offline detection works.

Tasks:
- Implement Drive Manager component (Rust)
- macOS Volume UUID resolution via IOKit / diskutil
- Stub Windows and Linux UUID resolution behind `#[cfg(target_os)]` — returns `Err(AppError::NotImplemented)` on other platforms
- Network share fingerprinting (hostname + path)
- `drive_register` Tauri command
- `drive_list` Tauri command
- `drive_remove` and `drive_remove_confirm` Tauri commands
- `drive_rename` Tauri command
- Drive watcher using notify crate (macOS FSEvents backend)
- Emit `drive:connected` and `drive:disconnected` events
- driveStore Zustand store
- Drive management UI (list, register dialog, remove confirmation)
- Online/offline status indicator

**Done when:** User can register a macOS drive or network share, see it listed with status, and remove it. Status updates in real time.

---

### Sprint 3 — Indexing Engine (M3)
**Goal:** Background indexing works end-to-end on macOS. Metadata extracted. Fingerprints computed. Duplicate detection works.

Tasks:
- Implement Indexer component (Rust, Tokio background task)
- Directory walker with file extension filtering
- Implement Hasher component — SHA256 partial hash for all files
- Implement Metadata Extractor — FFmpeg sidecar integration
- Download and bundle FFmpeg macOS static binaries (x86_64 + ARM64)
- Extract video metadata (duration, codec, frame rate, resolution)
- Extract audio metadata (duration, codec, sample rate)
- Extract image metadata (dimensions)
- Duplicate detection — fingerprint DB query
- Insert asset + location records
- Incremental re-index logic (skip unchanged files by size + modification date)
- `index_start` Tauri command (with serialization guard)
- `index_cancel` Tauri command
- `index_status` Tauri command
- Emit indexing progress events
- indexingStore Zustand store
- Indexing progress UI (progress bar, file counts, cancel button)
- Indexing confirmation dialog (drive name + thumbnail checkbox)

**Done when:** Indexing a macOS drive populates the database with assets and locations. Duplicate files detected and merged. Progress visible. Cancellation works cleanly.

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
- FFmpeg frame extraction at 10% duration for video — WebP output
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
- `asset_open` and `asset_reveal` commands (macOS: open -a, reveal in Finder)
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

**Done when:** User can open an asset, see all metadata and locations, play supported video formats on macOS WebKit, scrub the timeline, create named point and clip markers, and manage markers.

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

**Done when:** Settings screen complete. Drive removal correctly identifies orphaned assets and prompts user. Orphaned assets can be deleted individually or in bulk.

---

### Sprint 8 — macOS Validation (M12)
**Goal:** App validated end-to-end on macOS. All workflows tested. Known issues fixed.

Tasks:
- Full workflow test on macOS Apple Silicon (ARM64)
- Full workflow test on macOS Intel (x86_64)
- macOS 12 Monterey compatibility check
- File path normalization verification on macOS
- Volume UUID resolution verification on macOS
- WebP thumbnail rendering verification in WebKit
- H.264/MP4 and H.265/MP4 playback verification in WebKit
- notify crate FSEvents verification on macOS
- FFmpeg sidecar execution verification for both macOS architectures
- Performance test — search on 100K asset library
- Bug fixes from macOS validation

**Done when:** App passes all core workflows on macOS Apple Silicon and Intel without errors. Performance targets met.

---

### Sprint 9 — macOS Release Candidate (M13)
**Goal:** Polished, installable macOS app ready for 1.0.0 release.

Tasks:
- UI polish and consistency pass
- Error message review — all errors human-readable and actionable
- macOS .dmg installer build and signing
- macOS notarization (required for distribution outside App Store)
- README update with macOS installation and usage instructions
- CHANGELOG update for 1.0.0
- Known limitations documented (H.265 limitations, unsupported formats)
- Final bug fixes

**Done when:** macOS .dmg installer builds, installs, and runs cleanly. App is notarized. No known critical bugs.

---

## 4. Dependency Map

```
Sprint 1 (Scaffolding — macOS)
    │
    ├── Sprint 2 (Drive Management — macOS)
    │       │
    │       └── Sprint 3 (Indexing Engine — macOS FFmpeg)
    │               │
    │               ├── Sprint 4 (Library View + Tagging)
    │               │       │
    │               │       └── Sprint 5 (Thumbnails — macOS WebP)
    │               │               │
    │               │               └── Sprint 6 (Detail View + Playback + Markers)
    │               │                       │
    │               │                       └── Sprint 7 (Settings + Orphaned Assets)
    │               │                               │
    │               │                               └── Sprint 8 (macOS Validation)
    │               │                                       │
    │               │                                       └── Sprint 9 (macOS Release Candidate)
    │               │
    │               └── Sprint 3 also unblocks Sprint 5 (FFmpeg already integrated)
```

---

## 5. Future Platform Porting (Backlog)

Windows and Linux porting are backlog items with no assigned version. When planned, each port involves:

| Task | Notes |
|---|---|
| Drive UUID resolution | Implement Windows (`GetVolumeInformation`) or Linux (`/dev/disk/by-uuid/`) branch |
| notify crate verification | Verify `ReadDirectoryChangesW` (Windows) or `inotify` (Linux) behavior |
| FFmpeg binary | Download and bundle platform static build |
| Webview codec testing | Verify H.264/H.265 support in WebView2 (Windows) or WebKitGTK (Linux) |
| `asset_open` / `asset_reveal` | Implement platform-specific file open and reveal commands |
| Installer build | `.msi` (Windows) or `.deb` / `.AppImage` (Linux) |
| Platform validation sprint | Full workflow test on target platform |

Because platform-specific code is isolated behind `#[cfg(target_os)]` abstractions from Sprint 1, porting is additive — implement the missing platform branch without touching macOS code.

---

## 6. Complexity Estimates

| Sprint | Complexity | Primary Risk |
|---|---|---|
| 1 — Scaffolding | Low | Tauri + React setup friction |
| 2 — Drive Management | Low-Medium | macOS Volume UUID API familiarity |
| 3 — Indexing Engine | High | FFmpeg sidecar integration; async Rust complexity |
| 4 — Library + Tagging | Medium | Search query performance at scale |
| 5 — Thumbnails | Medium | FFmpeg WebP output; per-index toggle wiring |
| 6 — Detail + Playback + Markers | High | Video player + timeline + marker overlay complexity |
| 7 — Settings + Orphaned | Low-Medium | Orphan detection edge cases |
| 8 — macOS Validation | Low-Medium | Regression bugs from full workflow testing |
| 9 — Release Candidate | Low-Medium | macOS notarization process |

**Highest risk sprints:** Sprint 3 (FFmpeg + async Rust) and Sprint 6 (video player + markers). Both should be started with a proof-of-concept before full implementation.

---

## 7. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Updated to macOS-first release strategy. Version 1.0.0 targets macOS only. Windows/Linux porting moved to backlog. Sprint 1 adds platform abstraction module. Sprint 2 stubs Windows/Linux UUID resolution. Sprint 3 bundles macOS FFmpeg only. Sprint 8 updated to macOS-only validation. Sprint 9 updated to macOS .dmg + notarization. Added future porting section. |
