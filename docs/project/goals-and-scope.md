# Goals and Scope — Media Asset Manager

> Version: 1.1
> Status: Revised
> Stage: 1 — Project Definition
> Last Updated: 2026-05-19
> Change: Added video playback, scrubbing, and markers to MVP scope. Removed video playback from non-goals. Added lossless clip export to backlog. Updated terminology to SemVer and backlog conventions.

---

## 1. Vision Statement

A fast, lightweight, offline-first desktop application that gives content creators full visibility into their media libraries — regardless of whether the source drive is connected — with in-app video preview and marker-based clip identification.

---

## 2. Goals

| ID | Goal | Success Indicator |
|---|---|---|
| G-01 | Index media assets from any registered drive or folder | Indexing completes without errors; assets appear in library |
| G-02 | Tag assets with user-defined metadata | Tags persist across sessions and are searchable |
| G-03 | Enable search when drives are offline | Search returns relevant results regardless of drive status |
| G-04 | Optional thumbnail/preview generation | Thumbnails visible in asset list; toggle works correctly |
| G-05 | Cross-platform native desktop app | App installs and runs on Windows, macOS, and Linux |
| G-06 | Fully local, no cloud dependency | App works with no internet connection |
| G-07 | Basic in-app video playback and scrubbing | Natively supported formats play and scrub correctly in-app |
| G-08 | Marker creation and management per asset | Users can create, name, and manage markers and in/out clip points |

---

## 3. Non-Goals (Version 1.0.0)

The following are explicitly out of scope for version 1.0.0:

| ID | Item | Notes |
|---|---|---|
| NG-01 | Multi-user / team collaboration | Solo use only |
| NG-02 | Cloud sync or backup | Local-first design |
| NG-03 | Integration with external editing tools | Backlog item |
| NG-04 | Document asset types (PDF, project files) | Backlog item |
| NG-05 | Transcoding or media conversion | Not a media processing tool |
| NG-06 | Mobile (iOS / Android) | Desktop only |
| NG-07 | Duplicate detection | Backlog item |
| NG-08 | Batch tagging UI | Backlog item |
| NG-09 | Collections / albums | Backlog item |
| NG-10 | Advanced playback controls (speed, frame stepping, volume) | Backlog item |
| NG-11 | Lossless clip export | Backlog item |
| NG-12 | FFmpeg proxy playback for unsupported formats | Backlog item |

---

## 4. In-Scope Feature Summary (Version 1.0.0)

- Register drives and folders as media sources
- Index video, image, and audio files from registered sources
- Extract and store core metadata (name, path, type, size, duration, resolution, date)
- Create, assign, and remove user-defined flat tags
- Search and filter the index by keyword, tag, media type, date, and source drive
- Display drive online/offline status
- Display asset detail view (metadata, thumbnail, tags, markers)
- Optional thumbnail/preview generation (toggled in settings)
- Basic in-app video playback and timeline scrubbing (natively supported formats)
- External player fallback for unsupported video formats
- Create named single-point markers on video assets
- Create named in/out markers (clip ranges) on video assets
- Multiple markers per asset
- All metadata, tags, and markers stored in local database only
- Persistent local database (SQLite)
- Cross-platform installer (Windows, macOS, Linux)

---

## 5. User Personas

### Primary Persona — Freelance Videographer / Content Creator
- Shoots video for clients or personal projects
- Accumulates footage across multiple 2TB–8TB external drives
- Needs to locate a specific clip from a shoot months ago
- Cannot remember which drive a project is on
- Works alone; does not need sharing features
- Uses DaVinci Resolve or CapCut for editing
- Wants to mark good takes and clip ranges within long video files

---

## 6. Key User Journeys (High Level)

### Journey 1 — First-Time Setup
1. User installs the app
2. User connects an external drive
3. User registers the drive as a media source
4. App indexes all media files on the drive
5. User sees their library populated with assets

### Journey 2 — Offline Search
1. User disconnects the drive
2. User opens the app
3. User searches for "beach shoot 2024"
4. App returns matching assets with metadata and thumbnails
5. User identifies the asset and the drive it lives on
6. User sees any markers previously added to the asset

### Journey 3 — Tagging
1. User selects one or more assets
2. User assigns tags (e.g., "client acme", "b-roll", "summer campaign")
3. Tags are saved to the local database
4. User searches by tag later to find assets

### Journey 4 — Marker Creation
1. User opens a video asset in the detail view
2. User plays and scrubs through the video
3. User creates a named single-point marker at a key moment (e.g., "best reaction")
4. User creates a named in/out marker to designate a usable clip range (e.g., "hero shot")
5. Markers are saved to the database
6. User can later find and review markers on any asset

---

## 7. Scope Boundaries

| Boundary | In Scope | Out of Scope |
|---|---|---|
| Asset storage | Index/reference only | Physical file management |
| Media playback | Basic in-app preview (natively supported formats) | Full-featured media player |
| File editing | Tag and marker metadata only | Rename, move, delete, transcode files |
| Marker data | Stored in local database | Written back to media file |
| Network | Local LAN network shares | Internet/cloud |
| Users | Single user per install | Multi-user accounts |
| Clip export | None in MVP | Lossless clip export in backlog |

---

## 8. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Added video playback and markers to MVP scope and user journeys. Removed video playback from non-goals. Added lossless clip export and advanced controls to non-goals/backlog. Updated terminology to SemVer and backlog conventions. |
