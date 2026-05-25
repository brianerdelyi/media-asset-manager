# Requirements Traceability Matrix — Media Asset Manager

> Version: 1.3
> Status: Revised
> Stage: 2 — Requirements & Scope
> Last Updated: 2026-05-19
> Change: Added traceability for FR-92–FR-110 (duplicate detection, locations, orphaned assets). Added US-29 through US-32. Updated US-03, US-19, US-20, US-21, US-23 references.

---

## Purpose

This matrix traces user stories to functional requirements, ensuring full coverage and no orphaned requirements.

---

## Terminology

| Term | Definition |
|---|---|
| **Orphaned asset** | An indexed asset that has no remaining location on any registered drive |
| **Offline asset** | An asset whose drive is registered but currently disconnected |
| **Missing file** | A file that was indexed but is no longer found at its path on a reconnected drive |

---

## Traceability Table

| User Story | Title | Functional Requirements | NFR Coverage |
|---|---|---|---|
| US-01 | Register a media source | FR-01, FR-07, FR-08 | NFR-18 |
| US-02 | View registered sources | FR-02, FR-04 | NFR-17 |
| US-03 | Remove a media source | FR-03, FR-09, FR-101, FR-109 | NFR-18 |
| US-04 | Drive connection notification | FR-05, FR-06 | NFR-19 |
| US-05 | Index a drive | FR-11, FR-12, FR-13, FR-16, FR-17, FR-18, FR-19, FR-20 | NFR-01, NFR-03, NFR-06 |
| US-06 | Cancel indexing | FR-14 | NFR-14 |
| US-07 | Incremental re-index | FR-15 | NFR-05 |
| US-08 | Missing file detection | FR-21, FR-22, FR-103 | NFR-15 |
| US-09 | Enable thumbnail generation | FR-23, FR-24, FR-25, FR-26, FR-27, FR-29, FR-30 | NFR-04, NFR-06 |
| US-10 | Purge thumbnails | FR-28 | NFR-18 |
| US-11 | Create and apply tags | FR-31, FR-32, FR-34, FR-35, FR-36 | NFR-21 |
| US-12 | Remove a tag from an asset | FR-33 | NFR-21 |
| US-13 | Manage tags | FR-37, FR-38, FR-39, FR-40 | NFR-18 |
| US-14 | Search by filename | FR-42, FR-43, FR-49, FR-50, FR-51 | NFR-02 |
| US-15 | Filter by tag | FR-45, FR-48, FR-49, FR-50 | NFR-02 |
| US-16 | Filter by media type | FR-44, FR-48, FR-49 | NFR-02 |
| US-17 | Filter by date range | FR-46, FR-48, FR-49 | NFR-02 |
| US-18 | Offline search | FR-48, FR-50 | NFR-02, NFR-28 |
| US-19 | View asset details | FR-54, FR-55, FR-56, FR-57, FR-59, FR-62, FR-63, FR-100 | NFR-17 |
| US-20 | Open asset with OS default app | FR-60 | NFR-17 |
| US-21 | Reveal asset in file manager | FR-61 | NFR-17 |
| US-22 | Configure library location | FR-64, FR-65, FR-66 | NFR-32 |
| US-23 | View library statistics | FR-67 | NFR-21 |
| US-24 | Play a video asset in-app | FR-71, FR-72, FR-74, FR-75, FR-76, FR-77 | NFR-07, NFR-39 |
| US-25 | Scrub through a video timeline | FR-73, FR-78 | NFR-07 |
| US-26 | Create a single-point marker | FR-80, FR-82, FR-83, FR-86, FR-90 | NFR-18 |
| US-27 | Create an in/out marker | FR-81, FR-82, FR-83, FR-86, FR-90 | NFR-18 |
| US-28 | Manage markers on an asset | FR-84, FR-85, FR-87, FR-88, FR-89 | NFR-18 |
| US-29 | Automatic duplicate detection | FR-92, FR-93, FR-94, FR-95, FR-96, FR-97 | NFR-03, NFR-08 |
| US-30 | View all locations for an asset | FR-98, FR-99, FR-100 | NFR-17 |
| US-31 | Handle orphaned assets on drive removal | FR-09, FR-101, FR-102, FR-109 | NFR-18 |
| US-32 | Manage orphaned assets | FR-53, FR-104, FR-105, FR-106, FR-107, FR-108, FR-110 | NFR-18, NFR-21 |

---

## Functional Requirements Coverage Check

| FR ID | Requirement Summary | Covered By |
|---|---|---|
| FR-01 | Register drive/folder via browse dialog | US-01 |
| FR-02 | View registered sources | US-02 |
| FR-03 | Remove source | US-03 |
| FR-04 | Online/offline status | US-02 |
| FR-05 | Real-time drive detection | US-04 |
| FR-06 | Prompt to index on first connect | US-04 |
| FR-07 | Friendly name for source | US-01 |
| FR-08 | Platform drive UUID identification | US-01 |
| FR-09 | Drive removal orphan prompt | US-03, US-31 |
| FR-10 | Drag-and-drop registration | Backlog |
| FR-11 | Manual indexing trigger | US-05 |
| FR-12 | Background indexing | US-05 |
| FR-13 | Indexing progress display | US-05 |
| FR-14 | Cancel indexing | US-06 |
| FR-15 | Incremental re-index | US-07 |
| FR-16 | Video file support | US-05 |
| FR-17 | Image file support | US-05 |
| FR-18 | Audio file support | US-05 |
| FR-19 | Core metadata extraction | US-05 |
| FR-20 | Media-specific metadata | US-05 |
| FR-21 | Flag missing files | US-08 |
| FR-22 | Retain offline index records | US-08 |
| FR-23 | Thumbnail toggle setting | US-09 |
| FR-24 | Video thumbnail at 10% duration | US-09 |
| FR-25 | Image thumbnail generation | US-09 |
| FR-26 | Audio placeholder | US-09 |
| FR-27 | Thumbnails stored in app data | US-09 |
| FR-28 | Purge thumbnails | US-10 |
| FR-29 | Thumbnails after indexing | US-09 |
| FR-30 | Thumbnail placeholder | US-09 |
| FR-31 | Create tags | US-11 |
| FR-32 | Apply tags to assets | US-11 |
| FR-33 | Remove tag from asset | US-12 |
| FR-34 | Case-insensitive tags | US-11 |
| FR-35 | Tags support spaces | US-11 |
| FR-36 | Unlimited tags per asset | US-11 |
| FR-37 | Tag management screen | US-13 |
| FR-38 | Rename tag | US-13 |
| FR-39 | Delete tag | US-13 |
| FR-40 | Tag asset count | US-13 |
| FR-41 | Batch tagging | Backlog |
| FR-42 | Search by filename | US-14 |
| FR-43 | Search on Enter / button press | US-14 |
| FR-44 | Filter by media type | US-16 |
| FR-45 | Filter by tag | US-15 |
| FR-46 | Filter by date range | US-17 |
| FR-47 | Filter by source drive | US-14, US-15 |
| FR-48 | Offline search | US-18 |
| FR-49 | Combined search and filters | US-14, US-15, US-16, US-17 |
| FR-50 | Search result display | US-14, US-18 |
| FR-51 | Sort results | US-14 |
| FR-52 | Filter assets with markers | US-15, US-18 |
| FR-53 | Filter by status (all, orphaned, missing) | US-32 |
| FR-54 | Asset detail view | US-19 |
| FR-55 | Full metadata in detail view | US-19 |
| FR-56 | Thumbnail in detail view | US-19 |
| FR-57 | Tags in detail view | US-19 |
| FR-58 | Add/remove tags in detail view | US-12 |
| FR-59 | All locations in detail view | US-19, US-30 |
| FR-60 | Open with OS default app | US-20 |
| FR-61 | Reveal in file manager | US-21 |
| FR-62 | Markers in detail view | US-19, US-28 |
| FR-63 | Orphaned indicator in detail view | US-19, US-32 |
| FR-64 | Single library (1.0.0) | US-22 |
| FR-65 | Default library location | US-22 |
| FR-66 | Custom library location | US-22 |
| FR-67 | Library statistics | US-23 |
| FR-68 | Thumbnail toggle in settings | US-09 |
| FR-69 | Purge thumbnails in settings | US-10 |
| FR-70 | Bulk delete orphaned in settings | US-32 |
| FR-71 | In-app video player | US-24 |
| FR-72 | Play and pause controls | US-24 |
| FR-73 | Timeline scrubber | US-25 |
| FR-74 | Playback position and duration | US-24 |
| FR-75 | Supported format playback | US-24 |
| FR-76 | Unsupported format fallback | US-24 |
| FR-77 | Playback requires drive online | US-24 |
| FR-78 | Markers on video timeline | US-25, US-26, US-27 |
| FR-79 | Advanced playback controls | Backlog |
| FR-80 | Create single-point marker | US-26 |
| FR-81 | Create in/out marker | US-27 |
| FR-82 | Multiple markers per asset | US-26, US-27 |
| FR-83 | Marker name | US-26, US-27 |
| FR-84 | Edit marker name | US-28 |
| FR-85 | Delete marker | US-28 |
| FR-86 | Markers stored in DB only | US-26, US-27 |
| FR-87 | Markers available offline | US-28 |
| FR-88 | Marker list in detail view | US-28 |
| FR-89 | Click marker to seek | US-28 |
| FR-90 | Markers as timeline indicators | US-26, US-27 |
| FR-91 | Lossless clip export | Backlog |
| FR-92 | Content fingerprint for duplicate detection | US-29 |
| FR-93 | Fingerprint algorithm (SHA256 partial hash) | US-29 |
| FR-94 | Fingerprint stored in database | US-29 |
| FR-95 | Duplicate → add location, not new asset | US-29 |
| FR-96 | Cross-drive duplicate detection | US-29 |
| FR-97 | File size pre-filter before hashing | US-29 |
| FR-98 | Asset supports multiple location records | US-30 |
| FR-99 | Location record fields | US-30 |
| FR-100 | All locations displayed in detail view | US-19, US-30 |
| FR-101 | Delete location records on drive removal | US-03, US-31 |
| FR-102 | Asset marked orphaned when no locations remain | US-31 |
| FR-103 | Flag missing file on re-index | US-08 |
| FR-104 | Orphaned asset retained with metadata intact | US-32 |
| FR-105 | Orphaned asset clearly indicated | US-32 |
| FR-106 | Orphaned assets searchable and filterable | US-32 |
| FR-107 | No file access for orphaned assets | US-32 |
| FR-108 | Manual delete of orphaned asset | US-32 |
| FR-109 | Prompt user on orphan creation at drive removal | US-31 |
| FR-110 | Bulk delete orphaned assets from settings | US-32 |

---

## Resolved Design Decisions

| OQ | Question | Decision |
|---|---|---|
| OQ-06 | Drive identification | Platform UUID/serial normalized to UUID string in DB; network shares use hostname+path fingerprint |
| OQ-07 | Drive disconnection detection | Real-time via OS file system events (Rust `notify` crate) |
| OQ-08 | Thumbnail frame offset | Extract frame at 10% of total duration |
| OQ-09 | Search trigger | Enter key or Search button press; no live keystroke search in 1.0.0 |
| OQ-10 | Drive registration UX | Browse dialog for 1.0.0; drag-and-drop in backlog |
| OQ-11 | Duplicate detection method | SHA256 partial hash (first+last 64KB); full hash for files ≤128KB; file size as pre-filter only |
| OQ-12 | Duplicate asset handling | One asset record; multiple location records |
| OQ-13 | Multi-location display | Listed in detail view; no badge on asset card |
| OQ-14 | Orphaned asset on drive removal | Prompt user to keep or delete; kept orphans retain all metadata, tags, and markers |
| OQ-15 | Orphaned asset terminology | "Orphaned" confirmed as standard term throughout |

---

## Backlog Items — Not Traced to Version 1.0.0 Stories

| Item | FR Reference |
|---|---|
| Drive registration via drag-and-drop | FR-10 |
| Batch tagging | FR-41 |
| Advanced playback controls | FR-79 |
| Lossless clip export | FR-91 |
| Multiple library support | — |
| Hierarchical tags | — |
| Collections / Albums | — |
| Editor integration | — |
| Document asset types | — |
| Live keystroke search | — |

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Added traceability for playback and marker requirements. Added US-24 through US-28. |
| 1.2 | 2026-05-19 | Updated all FR references to match renumbered requirements. Added resolved design decisions OQ-06 through OQ-10. |
| 1.3 | 2026-05-19 | Added traceability for FR-92–FR-110 (duplicate detection, locations, orphaned assets). Added US-29 through US-32. Updated US-03, US-19, US-20, US-21, US-23. Added OQ-11 through OQ-15 to resolved decisions table. |
