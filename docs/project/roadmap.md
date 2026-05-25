# Project Roadmap — Media Asset Manager

> Version: 1.3
> Status: Revised
> Stage: 1 — Project Definition
> Last Updated: 2026-05-19
> Change: Updated version 1.0.0 to macOS only. Windows and Linux porting moved to backlog. Development build 0.8.0 updated to macOS validation. 0.9.0 updated to macOS release candidate. Added platform porting section to backlog.

---

## Roadmap Overview

This roadmap reflects a solo developer using AI-assisted tooling. Version 1.0.0 targets **macOS only**. Windows and Linux porting are backlog items with no assigned version. Versions will be assigned at planning time for each future release.

---

## Version 0.x.0 — Development Builds (Pre-Release)

Iterative development builds produced during SDLC Phases 5–7. Not released to end users. All builds target macOS.

| Build | Description |
|---|---|
| `0.1.0` | Project scaffolding, Tauri + React skeleton, SQLite connection, platform abstraction module |
| `0.2.0` | Drive registration and management (macOS) |
| `0.3.0` | Indexing engine, metadata extraction, fingerprinting |
| `0.4.0` | Library view, search, filtering, tagging |
| `0.5.0` | Thumbnail generation (WebP) |
| `0.6.0` | Asset detail view, video playback, markers |
| `0.7.0` | Settings, orphaned assets, drive removal flow |
| `0.8.0` | macOS validation and bug fixes |
| `0.9.0` | macOS release candidate — .dmg installer, notarization |

---

## Version 1.0.0 — MVP (macOS)

**Goal:** Functional offline media indexer with tagging, search, in-app playback, and markers. macOS only.

| Feature | Description |
|---|---|
| Drive/folder registration | Register and manage media sources (macOS drives and network shares) |
| Background indexing | Index video, image, and audio files with progress display |
| Incremental re-indexing | Only process new or changed files on re-index |
| Duplicate detection | SHA256 partial hash fingerprinting; one asset record per unique file |
| Metadata extraction | Filename, size, duration, resolution, codec, date |
| Flat tagging | Create, apply, rename, delete tags; tag management screen |
| Search and filtering | Search by filename, tag, type, date, source drive, status; works offline |
| Thumbnail generation | Optional, toggleable per-index; WebP 320px stored on disk |
| Drive status | Real-time online/offline detection via FSEvents; missing file flagging |
| Orphaned assets | Retained with user prompt on drive removal |
| Basic video playback | Play, pause, scrub — H.264/MP4 via macOS WebKit |
| External player fallback | Open unsupported formats in macOS default app |
| Markers | Named single-point markers and in/out clip markers per asset |
| Asset detail view | Full metadata, thumbnail, tags, locations, markers |
| Settings | Library location, thumbnail toggle, statistics, purge thumbnails |
| macOS installer | Signed and notarized .dmg |

---

## Backlog (Version TBD)

All items below are confirmed future intentions with no assigned version. Versions will be assigned during future release planning.

### Platform Ports

| Feature | Description |
|---|---|
| Windows port | Drive UUID via Win32, WebView2 codec testing, FFmpeg Windows binary, .msi installer |
| Linux port | Drive UUID via /dev/disk/by-uuid/, WebKitGTK codec testing, FFmpeg Linux binary, .deb/.AppImage installer |

### Usability & Library

| Feature | Description |
|---|---|
| Batch tagging | Apply tags to multiple selected assets simultaneously |
| Collections / Albums | Group assets into named collections |
| Saved searches | Save and reuse common search/filter combinations |
| Boolean search filters | AND/OR/NOT logic in search |
| Multiple library support | Create and switch between separate libraries |
| Hierarchical tags | Parent/child tag relationships |

### Playback & Markers

| Feature | Description |
|---|---|
| Advanced playback controls | Playback speed, frame stepping, volume control |
| FFmpeg proxy playback | Transcode unsupported formats to preview stream on the fly |
| Marker export | Export marker list to CSV or EDL format |

### Clip Export

| Feature | Description |
|---|---|
| Lossless clip export | Export a clip defined by in/out markers using stream copy (no transcoding); creates a new file without modifying the original |

### Editor Integration

| Feature | Description |
|---|---|
| Send to editor | Open a clip in the user's preferred video editor |
| Editor profiles | Save preferred editor executable paths per platform |
| DaVinci Resolve integration | Direct timeline send if API permits |
| CapCut integration | Send clip to CapCut project if API permits |

### Expanded Asset Types

| Feature | Description |
|---|---|
| Document indexing | PDF, project files, scripts |
| RAW image support | CR3, ARW, NEF and other camera RAW formats |
| Extended audio formats | AIFF, FLAC, OGG |

---

## SDLC Phase Status

| SDLC Phase | Description | Status |
|---|---|---|
| Phase 1 | Project Definition | ✅ Complete |
| Phase 2 | Requirements & Scope | ✅ Complete |
| Phase 3 | Architecture & Technical Design | ✅ Complete |
| Phase 4 | Implementation Planning | ✅ Complete |
| Phase 5 | Development | 🔲 Not Started |
| Phase 6 | Testing & QA | 🔲 Not Started |
| Phase 7 | Deployment & Operations | 🔲 Not Started |
| Phase 8 | Retrospective & Maintenance | 🔲 Not Started |

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Version 1.0.0 platform | macOS only | Ship a polished macOS app first; port later |
| Platform abstraction | `#[cfg(target_os)]` in `drives/platform.rs` | Porting is additive; no rewrites needed |
| Library model | Single library (1.0.0) | Simplicity; multiple library support in backlog |
| Database location | OS app data dir by default; user-configurable | Follows platform conventions |
| Thumbnail storage | WebP files on disk, relative paths in DB | Portable, efficient, easy to purge |
| Tag model | Flat tags (1.0.0) | Simpler to build and use; hierarchical in backlog |
| Indexing model | Background process, incremental re-index, serialized | Required for scale; avoids I/O contention |
| Duplicate detection | SHA256 partial hash every file; one DB query | Reliable offline; no pre-filter needed |
| Drive workflow | Register → prompt to index → background indexing | Clean UX |
| Playback engine | Native HTML5 webview | No extra dependencies for MVP |
| Playback fallback | Open in OS default player | Covers unsupported formats in 1.0.0 |
| Marker storage | Local SQLite database only | Never written back to media file |
| Versioning | SemVer Major.Minor.Patch | Industry standard |
| Post-MVP planning | Backlog / version TBD | Versions assigned at planning time |

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Added multiple library support and hierarchical tags to backlog; added key design decisions |
| 1.2 | 2026-05-19 | Restructured to SemVer versioning. All post-MVP features moved to backlog/TBD. Added video playback, markers, and lossless clip export. Added development build progression. Updated SDLC phase terminology. |
| 1.3 | 2026-05-19 | Updated version 1.0.0 to macOS only. Windows and Linux porting moved to backlog. Development builds updated to reflect macOS validation (0.8.0) and macOS release candidate (0.9.0). Version 1.0.0 feature table updated to reflect macOS-specific details. Added platform abstraction to key design decisions. Updated SDLC phase status to reflect Stages 3 and 4 complete. |
