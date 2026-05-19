# Goals and Scope — Media Asset Manager

> Version: 1.0
> Status: Draft
> Stage: 1 — Project Definition
> Last Updated: 2026-05-19

---

## 1. Vision Statement

A fast, lightweight, offline-first desktop application that gives content creators full visibility into their media libraries — regardless of whether the source drive is connected.

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

---

## 3. Non-Goals (MVP)

The following are explicitly out of scope for the MVP:

| ID | Item | Reason |
|---|---|---|
| NG-01 | Multi-user / team collaboration | Solo use only per requirements |
| NG-02 | Cloud sync or backup | Local-first design; adds complexity |
| NG-03 | Video playback | Out of scope; use OS default player |
| NG-04 | Editor integration (DaVinci, CapCut) | Future version feature |
| NG-05 | Document asset types (PDF, project files) | Future version feature |
| NG-06 | Transcoding or media conversion | Not a media processing tool |
| NG-07 | Mobile (iOS / Android) | Desktop only |
| NG-08 | Duplicate detection | Future enhancement |
| NG-09 | Batch tagging UI | Future enhancement |
| NG-10 | Collections / albums | Future enhancement |

---

## 4. In-Scope Feature Summary (MVP)

- Register drives and folders as media sources
- Index video, image, and audio files from registered sources
- Extract and store core metadata (name, path, type, size, duration, resolution, date)
- Create, assign, and remove user-defined tags
- Search and filter the index by keyword, tag, media type, and date
- Display drive online/offline status
- Display asset detail view (metadata + thumbnail if available)
- Optional thumbnail/preview generation (toggled in settings)
- Persistent local database (SQLite)
- Cross-platform installer (Windows, macOS, Linux)

---

## 5. User Personas

### Primary Persona — Freelance Videographer / Content Creator
- Shoots video for clients or personal projects
- Accumulates footage across multiple 2TB–8TB external drives
- Needs to locate a specific clip from a shoot 6 months ago
- Cannot remember which drive a project is on
- Works alone; does not need sharing features
- Uses DaVinci Resolve or CapCut for editing

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

### Journey 3 — Tagging
1. User selects one or more assets
2. User assigns tags (e.g., "client: acme", "type: broll", "project: summer-campaign")
3. Tags are saved to the local database
4. User searches by tag later to find assets

---

## 7. Scope Boundaries

| Boundary | In Scope | Out of Scope |
|---|---|---|
| Asset storage | Index/reference only | Physical file management |
| Media playback | Open with OS default app | In-app playback |
| File editing | Tag metadata only | Rename, move, delete files |
| Network | Local LAN network shares | Internet/cloud |
| Users | Single user per install | Multi-user accounts |

---

## 8. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft created during SDLC Stage 1 |
