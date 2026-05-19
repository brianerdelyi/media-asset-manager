# Requirements Traceability Matrix — Media Asset Manager

> Version: 1.1
> Status: Revised
> Stage: 2 — Requirements & Scope
> Last Updated: 2026-05-19
> Change: Added traceability for FR-49, FR-58, FR-65–FR-85 (playback and markers). Added US-24 through US-28. Updated version terminology.

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
| US-05 | Index a drive | FR-09, FR-10, FR-11, FR-14, FR-15, FR-16, FR-17, FR-18 | NFR-01, NFR-03, NFR-06 |
| US-06 | Cancel indexing | FR-12 | NFR-14 |
| US-07 | Incremental re-index | FR-13 | NFR-05 |
| US-08 | Missing file detection | FR-19, FR-20 | NFR-15 |
| US-09 | Enable thumbnail generation | FR-21, FR-22, FR-23, FR-24, FR-25, FR-27, FR-28 | NFR-04, NFR-06 |
| US-10 | Purge thumbnails | FR-26 | NFR-18 |
| US-11 | Create and apply tags | FR-29, FR-30, FR-32, FR-33, FR-34 | NFR-21 |
| US-12 | Remove a tag from an asset | FR-31 | NFR-21 |
| US-13 | Manage tags | FR-35, FR-36, FR-37, FR-38 | NFR-18 |
| US-14 | Search by filename | FR-40, FR-46, FR-47, FR-48 | NFR-02 |
| US-15 | Filter by tag | FR-42, FR-45, FR-46, FR-47 | NFR-02 |
| US-16 | Filter by media type | FR-41, FR-45, FR-46 | NFR-02 |
| US-17 | Filter by date range | FR-43, FR-45, FR-46 | NFR-02 |
| US-18 | Offline search | FR-45, FR-47 | NFR-02, NFR-28 |
| US-19 | View asset details | FR-50, FR-51, FR-52, FR-53, FR-55, FR-58 | NFR-17 |
| US-20 | Open asset with OS default app | FR-56 | NFR-17 |
| US-21 | Reveal asset in file manager | FR-57 | NFR-17 |
| US-22 | Configure library location | FR-59, FR-60, FR-61 | NFR-32 |
| US-23 | View library statistics | FR-62 | NFR-21 |
| US-24 | Play a video asset in-app | FR-65, FR-66, FR-68, FR-69, FR-70, FR-71 | NFR-07, NFR-39 |
| US-25 | Scrub through a video timeline | FR-67, FR-72 | NFR-07 |
| US-26 | Create a single-point marker | FR-74, FR-76, FR-77, FR-80, FR-84 | NFR-18 |
| US-27 | Create an in/out marker | FR-75, FR-76, FR-77, FR-80, FR-84 | NFR-18 |
| US-28 | Manage markers on an asset | FR-78, FR-79, FR-81, FR-82, FR-83 | NFR-18 |

---

## Functional Requirements Coverage Check

| FR ID | Requirement Summary | Covered By |
|---|---|---|
| FR-01 | Register drive/folder | US-01 |
| FR-02 | View registered sources | US-02 |
| FR-03 | Remove source | US-03 |
| FR-04 | Online/offline status | US-02 |
| FR-05 | Drive connection detection | US-04 |
| FR-06 | Prompt to index on first connect | US-04 |
| FR-07 | Friendly name for source | US-01 |
| FR-08 | Drive unique identifier | US-01 |
| FR-09 | Manual indexing trigger | US-05 |
| FR-10 | Background indexing | US-05 |
| FR-11 | Indexing progress display | US-05 |
| FR-12 | Cancel indexing | US-06 |
| FR-13 | Incremental re-index | US-07 |
| FR-14 | Video file support | US-05 |
| FR-15 | Image file support | US-05 |
| FR-16 | Audio file support | US-05 |
| FR-17 | Core metadata extraction | US-05 |
| FR-18 | Media-specific metadata | US-05 |
| FR-19 | Flag missing files | US-08 |
| FR-20 | Retain offline index records | US-08 |
| FR-21 | Thumbnail toggle setting | US-09 |
| FR-22 | Video thumbnail generation | US-09 |
| FR-23 | Image thumbnail generation | US-09 |
| FR-24 | Audio placeholder | US-09 |
| FR-25 | Thumbnails stored in app data | US-09 |
| FR-26 | Purge thumbnails | US-10 |
| FR-27 | Thumbnails after indexing | US-09 |
| FR-28 | Thumbnail placeholder | US-09 |
| FR-29 | Create tags | US-11 |
| FR-30 | Apply tags to assets | US-11 |
| FR-31 | Remove tag from asset | US-12 |
| FR-32 | Case-insensitive tags | US-11 |
| FR-33 | Tags support spaces | US-11 |
| FR-34 | Unlimited tags per asset | US-11 |
| FR-35 | Tag management screen | US-13 |
| FR-36 | Rename tag | US-13 |
| FR-37 | Delete tag | US-13 |
| FR-38 | Tag asset count | US-13 |
| FR-39 | Batch tagging | Backlog |
| FR-40 | Search by filename | US-14 |
| FR-41 | Filter by media type | US-16 |
| FR-42 | Filter by tag | US-15 |
| FR-43 | Filter by date range | US-17 |
| FR-44 | Filter by source drive | US-14, US-15 |
| FR-45 | Offline search | US-18 |
| FR-46 | Combined search and filters | US-14, US-15, US-16, US-17 |
| FR-47 | Search result display | US-14, US-18 |
| FR-48 | Sort results | US-14 |
| FR-49 | Filter assets with markers | US-15, US-18 |
| FR-50 | Asset detail view | US-19 |
| FR-51 | Full metadata in detail view | US-19 |
| FR-52 | Thumbnail in detail view | US-19 |
| FR-53 | Tags in detail view | US-19 |
| FR-54 | Add/remove tags in detail view | US-12 |
| FR-55 | Source drive info in detail view | US-19 |
| FR-56 | Open with OS default app | US-20 |
| FR-57 | Reveal in file manager | US-21 |
| FR-58 | Markers in detail view | US-19, US-28 |
| FR-59 | Single library (1.0.0) | US-22 |
| FR-60 | Default library location | US-22 |
| FR-61 | Custom library location | US-22 |
| FR-62 | Library statistics | US-23 |
| FR-63 | Thumbnail toggle in settings | US-09 |
| FR-64 | Purge thumbnails in settings | US-10 |
| FR-65 | In-app video player | US-24 |
| FR-66 | Play and pause controls | US-24 |
| FR-67 | Timeline scrubber | US-25 |
| FR-68 | Playback position and duration display | US-24 |
| FR-69 | Supported format playback | US-24 |
| FR-70 | Unsupported format fallback | US-24 |
| FR-71 | Playback requires drive online | US-24 |
| FR-72 | Markers on video timeline | US-25, US-26, US-27 |
| FR-73 | Advanced controls (backlog) | Backlog |
| FR-74 | Create single-point marker | US-26 |
| FR-75 | Create in/out marker | US-27 |
| FR-76 | Multiple markers per asset | US-26, US-27 |
| FR-77 | Marker name | US-26, US-27 |
| FR-78 | Edit marker name | US-28 |
| FR-79 | Delete marker | US-28 |
| FR-80 | Markers stored in DB only | US-26, US-27 |
| FR-81 | Markers available offline | US-28 |
| FR-82 | Marker list in detail view | US-28 |
| FR-83 | Click marker to seek | US-28 |
| FR-84 | Markers as timeline indicators | US-26, US-27 |
| FR-85 | Lossless clip export (backlog) | Backlog |

---

## Backlog Items — Not Traced to MVP Stories

| Item | Target |
|---|---|
| FR-39 — Batch tagging | Backlog |
| FR-73 — Advanced playback controls | Backlog |
| FR-85 — Lossless clip export | Backlog |
| Multiple library support | Backlog |
| Hierarchical tags | Backlog |
| Collections / Albums | Backlog |
| Editor integration | Backlog |
| Document asset types | Backlog |
| Duplicate detection | Backlog |

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Added traceability for FR-49, FR-58, FR-65–FR-85. Added US-24 through US-28 to traceability table. Updated backlog section. Updated version terminology. |
