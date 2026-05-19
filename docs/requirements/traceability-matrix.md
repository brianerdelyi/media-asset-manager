# Requirements Traceability Matrix — Media Asset Manager

> Version: 1.2
> Status: Revised
> Stage: 2 — Requirements & Scope
> Last Updated: 2026-05-19
> Change: Updated all FR references to match renumbered requirements in functional-requirements.md v1.2. Resolved OQ-06 through OQ-10.

---

## Purpose

This matrix traces user stories to functional requirements, ensuring full coverage and no orphaned requirements.

---

## Traceability Table

| User Story | Title | Functional Requirements | NFR Coverage |
|---|---|---|---|
| US-01 | Register a media source | FR-01, FR-07, FR-08 | NFR-18 |
| US-02 | View registered sources | FR-02, FR-04 | NFR-17 |
| US-03 | Remove a media source | FR-03 | NFR-18 |
| US-04 | Drive connection notification | FR-05, FR-06 | NFR-19 |
| US-05 | Index a drive | FR-10, FR-11, FR-12, FR-15, FR-16, FR-17, FR-18, FR-19 | NFR-01, NFR-03, NFR-06 |
| US-06 | Cancel indexing | FR-13 | NFR-14 |
| US-07 | Incremental re-index | FR-14 | NFR-05 |
| US-08 | Missing file detection | FR-20, FR-21 | NFR-15 |
| US-09 | Enable thumbnail generation | FR-22, FR-23, FR-24, FR-25, FR-26, FR-28, FR-29 | NFR-04, NFR-06 |
| US-10 | Purge thumbnails | FR-27 | NFR-18 |
| US-11 | Create and apply tags | FR-30, FR-31, FR-33, FR-34, FR-35 | NFR-21 |
| US-12 | Remove a tag from an asset | FR-32 | NFR-21 |
| US-13 | Manage tags | FR-36, FR-37, FR-38, FR-39 | NFR-18 |
| US-14 | Search by filename | FR-41, FR-42, FR-48, FR-49, FR-50 | NFR-02 |
| US-15 | Filter by tag | FR-44, FR-47, FR-48, FR-49 | NFR-02 |
| US-16 | Filter by media type | FR-43, FR-47, FR-48 | NFR-02 |
| US-17 | Filter by date range | FR-45, FR-47, FR-48 | NFR-02 |
| US-18 | Offline search | FR-47, FR-49 | NFR-02, NFR-28 |
| US-19 | View asset details | FR-52, FR-53, FR-54, FR-55, FR-57, FR-60 | NFR-17 |
| US-20 | Open asset with OS default app | FR-58 | NFR-17 |
| US-21 | Reveal asset in file manager | FR-59 | NFR-17 |
| US-22 | Configure library location | FR-61, FR-62, FR-63 | NFR-32 |
| US-23 | View library statistics | FR-64 | NFR-21 |
| US-24 | Play a video asset in-app | FR-67, FR-68, FR-70, FR-71, FR-72, FR-73 | NFR-07, NFR-39 |
| US-25 | Scrub through a video timeline | FR-69, FR-74 | NFR-07 |
| US-26 | Create a single-point marker | FR-76, FR-78, FR-79, FR-82, FR-86 | NFR-18 |
| US-27 | Create an in/out marker | FR-77, FR-78, FR-79, FR-82, FR-86 | NFR-18 |
| US-28 | Manage markers on an asset | FR-80, FR-81, FR-83, FR-84, FR-85 | NFR-18 |

---

## Functional Requirements Coverage Check

| FR ID | Requirement Summary | Covered By |
|---|---|---|
| FR-01 | Register drive/folder via browse dialog | US-01 |
| FR-02 | View registered sources | US-02 |
| FR-03 | Remove source | US-03 |
| FR-04 | Online/offline status | US-02 |
| FR-05 | Real-time drive detection via OS events | US-04 |
| FR-06 | Prompt to index on first connect | US-04 |
| FR-07 | Friendly name for source | US-01 |
| FR-08 | Platform drive UUID identification | US-01 |
| FR-09 | Drag-and-drop registration | Backlog |
| FR-10 | Manual indexing trigger | US-05 |
| FR-11 | Background indexing | US-05 |
| FR-12 | Indexing progress display | US-05 |
| FR-13 | Cancel indexing | US-06 |
| FR-14 | Incremental re-index | US-07 |
| FR-15 | Video file support | US-05 |
| FR-16 | Image file support | US-05 |
| FR-17 | Audio file support | US-05 |
| FR-18 | Core metadata extraction | US-05 |
| FR-19 | Media-specific metadata | US-05 |
| FR-20 | Flag missing files | US-08 |
| FR-21 | Retain offline index records | US-08 |
| FR-22 | Thumbnail toggle setting | US-09 |
| FR-23 | Video thumbnail at 10% duration | US-09 |
| FR-24 | Image thumbnail generation | US-09 |
| FR-25 | Audio placeholder | US-09 |
| FR-26 | Thumbnails stored in app data | US-09 |
| FR-27 | Purge thumbnails | US-10 |
| FR-28 | Thumbnails after indexing | US-09 |
| FR-29 | Thumbnail placeholder | US-09 |
| FR-30 | Create tags | US-11 |
| FR-31 | Apply tags to assets | US-11 |
| FR-32 | Remove tag from asset | US-12 |
| FR-33 | Case-insensitive tags | US-11 |
| FR-34 | Tags support spaces | US-11 |
| FR-35 | Unlimited tags per asset | US-11 |
| FR-36 | Tag management screen | US-13 |
| FR-37 | Rename tag | US-13 |
| FR-38 | Delete tag | US-13 |
| FR-39 | Tag asset count | US-13 |
| FR-40 | Batch tagging | Backlog |
| FR-41 | Search by filename | US-14 |
| FR-42 | Search on Enter / button press | US-14 |
| FR-43 | Filter by media type | US-16 |
| FR-44 | Filter by tag | US-15 |
| FR-45 | Filter by date range | US-17 |
| FR-46 | Filter by source drive | US-14, US-15 |
| FR-47 | Offline search | US-18 |
| FR-48 | Combined search and filters | US-14, US-15, US-16, US-17 |
| FR-49 | Search result display | US-14, US-18 |
| FR-50 | Sort results | US-14 |
| FR-51 | Filter assets with markers | US-15, US-18 |
| FR-52 | Asset detail view | US-19 |
| FR-53 | Full metadata in detail view | US-19 |
| FR-54 | Thumbnail in detail view | US-19 |
| FR-55 | Tags in detail view | US-19 |
| FR-56 | Add/remove tags in detail view | US-12 |
| FR-57 | Source drive info in detail view | US-19 |
| FR-58 | Open with OS default app | US-20 |
| FR-59 | Reveal in file manager | US-21 |
| FR-60 | Markers in detail view | US-19, US-28 |
| FR-61 | Single library (1.0.0) | US-22 |
| FR-62 | Default library location | US-22 |
| FR-63 | Custom library location | US-22 |
| FR-64 | Library statistics | US-23 |
| FR-65 | Thumbnail toggle in settings | US-09 |
| FR-66 | Purge thumbnails in settings | US-10 |
| FR-67 | In-app video player | US-24 |
| FR-68 | Play and pause controls | US-24 |
| FR-69 | Timeline scrubber | US-25 |
| FR-70 | Playback position and duration display | US-24 |
| FR-71 | Supported format playback | US-24 |
| FR-72 | Unsupported format fallback | US-24 |
| FR-73 | Playback requires drive online | US-24 |
| FR-74 | Markers on video timeline | US-25, US-26, US-27 |
| FR-75 | Advanced controls | Backlog |
| FR-76 | Create single-point marker | US-26 |
| FR-77 | Create in/out marker | US-27 |
| FR-78 | Multiple markers per asset | US-26, US-27 |
| FR-79 | Marker name | US-26, US-27 |
| FR-80 | Edit marker name | US-28 |
| FR-81 | Delete marker | US-28 |
| FR-82 | Markers stored in DB only | US-26, US-27 |
| FR-83 | Markers available offline | US-28 |
| FR-84 | Marker list in detail view | US-28 |
| FR-85 | Click marker to seek | US-28 |
| FR-86 | Markers as timeline indicators | US-26, US-27 |
| FR-87 | Lossless clip export | Backlog |

---

## Resolved Design Decisions

| OQ | Question | Decision |
|---|---|---|
| OQ-06 | Drive identification | Platform UUID/serial normalized to UUID string in DB; network shares use hostname+path fingerprint |
| OQ-07 | Drive disconnection detection | Real-time via OS file system events (Rust `notify` crate) |
| OQ-08 | Thumbnail frame offset | Extract frame at 10% of total duration |
| OQ-09 | Search trigger | Enter key or Search button press; no live keystroke search in 1.0.0 |
| OQ-10 | Drive registration UX | Browse dialog for 1.0.0; drag-and-drop in backlog |

---

## Backlog Items — Not Traced to Version 1.0.0 Stories

| Item | FR Reference |
|---|---|
| Drive registration via drag-and-drop | FR-09 |
| Batch tagging | FR-40 |
| Advanced playback controls | FR-75 |
| Lossless clip export | FR-87 |
| Multiple library support | — |
| Hierarchical tags | — |
| Collections / Albums | — |
| Editor integration | — |
| Document asset types | — |
| Duplicate detection | — |
| Live keystroke search | — |

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Added traceability for playback and marker requirements. Added US-24 through US-28. |
| 1.2 | 2026-05-19 | Updated all FR references to match renumbered requirements (v1.2). Added resolved design decisions table for OQ-06 through OQ-10. |
