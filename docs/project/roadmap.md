# Project Roadmap — Media Asset Manager

> Version: 1.2
> Status: Revised
> Stage: 1 — Project Definition
> Last Updated: 2026-05-19
> Change: Restructured from named phases to SemVer versions. All post-MVP features moved to backlog with version TBD. Added video playback, markers, and lossless clip export. Updated SDLC phase terminology.

---

## Roadmap Overview

This roadmap reflects a solo developer using AI-assisted tooling. The MVP targets version `1.0.0`. All post-MVP features are captured in the backlog with no assigned version. Versions will be assigned at planning time for each future release.

---

## Version 0.x.0 — Development Builds (Pre-Release)

Iterative development builds produced during SDLC Phases 5–7. Not released to end users.

| Build | Description |
|---|---|
| `0.1.0` | Project scaffolding, Tauri + React skeleton, SQLite connection |
| `0.2.0` | Drive registration and basic indexing |
| `0.3.0` | Metadata extraction and library view |
| `0.4.0` | Tagging and search |
| `0.5.0` | Thumbnail generation |
| `0.6.0` | Video playback and markers |
| `0.7.0` | Settings, library stats, full UI |
| `0.8.0` | Cross-platform testing and bug fixes |
| `0.9.0` | Release candidate |

---

## Version 1.0.0 — MVP

**Goal:** Functional offline media indexer with tagging, search, in-app playback, and markers.

| Feature | Description |
|---|---|
| Drive/folder registration | Register and manage media sources |
| Background indexing | Index video, image, and audio files with progress display |
| Incremental re-indexing | Only process new or changed files on re-index |
| Metadata extraction | Filename, size, duration, resolution, codec, date |
| Flat tagging | Create, apply, rename, delete tags; tag management screen |
| Search and filtering | Search by filename, tag, type, date, source drive; works offline |
| Thumbnail generation | Optional, toggleable; stored in app data directory |
| Drive status | Online/offline detection; missing file flagging |
| Basic video playback | Play, pause, scrub — natively supported formats (H.264/MP4 primary) |
| External player fallback | Open unsupported formats in OS default player |
| Markers | Named single-point markers and in/out clip markers per asset |
| Asset detail view | Full metadata, thumbnail, tags, markers |
| Settings | Library location, thumbnail toggle, purge thumbnails |
| Cross-platform installers | Windows (.msi), macOS (.dmg), Linux (.deb / .AppImage) |

---

## Backlog (Version TBD)

All items below are confirmed future intentions with no assigned version. Versions will be assigned during future release planning.

### Usability & Library

| Feature | Description |
|---|---|
| Batch tagging | Apply tags to multiple selected assets simultaneously |
| Collections / Albums | Group assets into named collections |
| Duplicate detection | Flag likely duplicate files across drives |
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
| Phase 3 | Architecture & Technical Design | 🔲 Not Started |
| Phase 4 | Implementation Planning | 🔲 Not Started |
| Phase 5 | Development | 🔲 Not Started |
| Phase 6 | Testing & QA | 🔲 Not Started |
| Phase 7 | Deployment & Operations | 🔲 Not Started |
| Phase 8 | Retrospective & Maintenance | 🔲 Not Started |

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Library model | Single library (1.0.0) | Simplicity; multiple library support in backlog |
| Database location | OS app data dir by default; user-configurable | Follows platform conventions |
| Tag model | Flat tags (1.0.0) | Simpler to build and use; hierarchical in backlog |
| Indexing model | Background process, incremental re-index | Required for scale (100K+ assets) |
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
