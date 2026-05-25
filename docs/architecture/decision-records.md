# Architecture Decision Records — Media Asset Manager

> Version: 1.2
> Status: Revised
> Stage: 3 — Architecture & Technical Design
> Last Updated: 2026-05-19
> Change: Revised ADR-004 — removed file size pre-filter, simplified to always hash every file. Clarified one-sided hash comparison against stored fingerprint.

---

## ADR-001 — Tauri 2.x as Application Shell

**Status:** Accepted
**Date:** 2026-05-19

### Context
A cross-platform desktop application is required for Windows, macOS, and Linux. Options considered were Tauri, Electron, Flutter Desktop, and Python + PyQt6.

### Decision
Use Tauri 2.x with a React + TypeScript frontend.

### Rationale
- Significantly smaller binary and memory footprint than Electron
- Rust backend provides native filesystem access, ideal for drive monitoring and file operations
- Strong ecosystem support for SQLite, file system events, and FFmpeg sidecar
- React + TypeScript frontend is well-supported by AI coding tools (Claude, Copilot, Cursor)
- Tauri bundler produces native installers for all three platforms

### Tradeoffs
- Tauri ecosystem is younger than Electron; some edge cases may require workarounds
- Rust backend requires Rust knowledge for backend changes
- WebView differences between platforms may cause minor UI inconsistencies

### Alternatives Rejected
- **Electron:** Larger bundle, higher memory use, no meaningful advantage for this use case
- **Flutter Desktop:** Less mature for desktop, weaker AI tooling support, unfamiliar ecosystem
- **Python + PyQt6:** Slower, less modern UI, packaging complexity

### Fallback
If Tauri presents blocking issues, Electron is the identified fallback.

---

## ADR-002 — SQLite as Local Database

**Status:** Accepted
**Date:** 2026-05-19

### Context
A persistent local index of media assets is required. The database must work offline, support up to 500,000 records, and be portable.

### Decision
Use SQLite via `rusqlite` in the Rust backend. Enable WAL (Write-Ahead Logging) mode.

### Rationale
- Embedded, file-based, zero configuration
- Excellent performance for read-heavy workloads up to millions of rows
- WAL mode provides crash safety and concurrent read performance
- Single file is easy to back up and move
- Well-supported in Rust via `rusqlite`

### Tradeoffs
- Not suitable for multi-user concurrent writes (acceptable — single user app)
- Large BLOBs degrade performance (mitigated by storing thumbnails on disk)

### Alternatives Rejected
- **PostgreSQL local:** Overkill for single-user; complex setup; not portable
- **Flat JSON files:** No query capability; poor performance at scale

---

## ADR-003 — Thumbnails Stored as WebP Files on Disk

**Status:** Accepted
**Date:** 2026-05-19
**Revised:** 2026-05-19 — Updated thumbnail format from JPEG to WebP

### Context
Thumbnail images must be generated and displayed for video and image assets. The storage location and format affects database size, query performance, storage efficiency, and portability.

### Decision
Store thumbnails as WebP files in a `thumbnails/` subdirectory co-located with `library.db`. Store relative paths in the database. Fixed settings: 320px longest edge, lossy WebP quality 75.

### Rationale
- WebP produces ~30–50% smaller files than JPEG at equivalent visual quality for photographic content
- WebP is natively supported in all three platform webviews used by Tauri (Chromium-based on Windows, WebKit on macOS, WebKitGTK on Linux)
- FFmpeg generates WebP natively — no additional tooling required
- Relative paths maintain portability — the library folder can be moved without breaking references
- Tauri can serve local files directly to the webview via asset protocol
- Thumbnails can be purged independently without affecting the database
- Each library has its own `thumbnails/` folder, naturally isolating thumbnails across libraries in future

### Storage Estimates
| Library Size | WebP (~15KB avg) |
|---|---|
| 10,000 assets | ~150MB |
| 100,000 assets | ~1.5GB |
| 500,000 assets | ~7.5GB |

### Tradeoffs
- Two artifacts to manage (database + thumbnails folder)
- Manual deletion of thumbnails folder creates stale path references in DB (mitigated by placeholder fallback)

### Alternatives Rejected
- **JPEG:** ~2x larger than WebP for equivalent quality; no advantage for this use case
- **PNG:** Lossless compression performs poorly on photographic content; much larger files
- **SQLite BLOBs:** Poor performance at 100K+ assets; complex Tauri bridge rendering pipeline
- **HEIC:** Excellent compression but poor support on Windows and Linux webviews

---

## ADR-004 — Partial Hash Fingerprinting for Duplicate Detection

**Status:** Accepted
**Date:** 2026-05-19
**Revised:** 2026-05-19 — Removed file size pre-filter. Hash computed for every file always. Clarified one-sided comparison against stored fingerprint.

### Context
Media assets (especially video files up to 25GB+) may exist on multiple drives. Duplicate detection must be reliable, work correctly when source drives are offline, and not make indexing impractically slow.

### Decision
Compute a SHA256 partial hash for **every file** at index time, regardless of whether a potential duplicate exists:
- Files > 128KB: SHA256(first 64KB + last 64KB)
- Files ≤ 128KB: SHA256(entire file)

Store the fingerprint in the `assets` table immediately. To detect duplicates, query the database for an existing asset with a matching fingerprint. Only the currently indexed file is ever read — the source drive of the existing asset does not need to be online.

### Algorithm

```
For every file during indexing:
    1. Compute partial hash of the current file (drive must be online — it is being indexed)
    2. Query DB: SELECT id FROM assets WHERE fingerprint = ?
    3. Match  → add new location record to existing asset
    4. No match → insert new asset record with fingerprint stored
```

### Rationale
- Hashing 128KB from a 25GB file takes ~1–2ms — negligible cost per file
- Every asset always has a stored fingerprint from first index — no null fingerprint edge cases
- Duplicate detection works correctly when the original drive is offline — only the stored fingerprint is needed for comparison, not a live re-read of the original file
- Simpler than a two-step size pre-filter approach — one DB query per file instead of two
- Reliable for real media files — camera-generated files embed unique timestamps in headers making collisions extremely unlikely

### Why the File Size Pre-Filter Was Removed
An earlier design used file size as a pre-filter to avoid hashing every file. This was removed because:
- If hashing is skipped for files with no size match, those assets have no stored fingerprint
- If a duplicate later appears, the original drive may be offline and cannot be re-hashed
- The pre-filter added a second DB query per file and code complexity with no meaningful performance benefit given that the partial hash cost is ~1–2ms per file

### Tradeoffs
- Theoretical false positive if two files share the same first/last 64KB content (extremely unlikely for real camera-generated media files)
- Not intended to detect modified files — a modified file produces a different fingerprint and is treated as a new asset (intentional behavior)

### Alternatives Rejected
- **Full SHA256:** Impractical — 3–8 minutes per 25GB file
- **Filename + size only:** Too many false positives (e.g. multiple files named `IMG_0001.MP4`)
- **File size pre-filter + conditional hash:** Creates null fingerprint edge cases that break offline duplicate detection

---

## ADR-005 — One Asset Record, Multiple Location Records

**Status:** Accepted
**Date:** 2026-05-19

### Context
The same physical media file may exist on multiple drives (backups, duplicates). The data model must represent this without creating duplicate asset entries.

### Decision
One `assets` record per unique file (identified by fingerprint). One or more `locations` records per asset, each representing a known file path on a specific drive.

### Rationale
- Tags and markers applied to an asset apply regardless of which drive copy is used
- Users see one library entry per unique file, not one per copy
- When one location goes offline, the asset remains accessible via other locations
- Naturally extends to multiple library support in future

### Tradeoffs
- Slightly more complex queries (JOIN locations when drive status matters)
- Drive removal logic must handle orphan detection carefully

---

## ADR-006 — Orphaned Asset Retention with User Prompt

**Status:** Accepted
**Date:** 2026-05-19

### Context
When a user removes a registered drive, assets that have no remaining locations become orphaned. The app must decide what to do with these assets.

### Decision
When a drive removal would create orphaned assets: prompt the user with a count and offer to keep or delete. Kept orphans remain in the library with all metadata, tags, and markers intact but with no file access.

### Rationale
- Tags and markers represent user work that should not be silently destroyed
- Users may intentionally keep orphaned assets as a record that the file existed
- Giving the user the choice is least surprising
- Orphaned assets remain searchable and useful as a reference

### Tradeoffs
- Adds a confirmation step to drive removal
- Library can accumulate orphaned assets over time (mitigated by bulk delete in settings)

---

## ADR-007 — Native Webview Video Playback with External Player Fallback

**Status:** Accepted
**Date:** 2026-05-19

### Context
In-app video preview is required. Tauri's frontend uses the OS native webview which has platform-dependent codec support. Content creators commonly use H.264 and H.265 in MP4 containers.

### Decision
Use HTML5 `<video>` element for in-app playback. Support natively playable formats (primarily H.264/MP4). Display "Open in external player" button for unsupported formats.

### Rationale
- No additional dependencies required for MVP
- H.264/MP4 plays reliably on all three platforms
- External player fallback covers unsupported formats without blocking MVP
- Simple and reliable for the most common formats

### Tradeoffs
- H.265/MP4 may not play on all platforms (Windows WebView2 requires codec pack on some versions)
- MOV, MKV, AVI not reliably supported in webviews
- Users with primarily H.265 or MOV footage will need external player frequently

### Future Mitigation
FFmpeg proxy playback (transcode to preview stream on demand) is in the backlog for a future version.

---

## ADR-008 — FFmpeg as Bundled Sidecar

**Status:** Accepted
**Date:** 2026-05-19

### Context
Metadata extraction and thumbnail generation require media processing capabilities beyond what Rust's standard library provides.

### Decision
Bundle FFmpeg as a platform-specific binary sidecar invoked via Tauri's sidecar API. Do not link FFmpeg as a library.

### Rationale
- Avoids GPL/LGPL static linking complications
- Tauri's sidecar API handles platform-specific binary selection
- FFmpeg is the industry standard for media metadata extraction
- Command invocation is simple and well-understood
- No runtime dependency on the user having FFmpeg installed

### Tradeoffs
- Increases installer size (~50–70MB per platform using essentials static build)
- Sidecar process startup adds minor latency per extraction
- Must keep FFmpeg version pinned and updated with app releases

### Alternatives Rejected
- **System FFmpeg:** Users may not have it installed; version inconsistencies across platforms
- **mediainfo:** Good for metadata but cannot generate thumbnails
- **Native Rust media libraries:** Less mature, less format coverage than FFmpeg

---

## ADR-009 — Zustand for Frontend State Management

**Status:** Accepted
**Date:** 2026-05-19

### Context
The React frontend needs state management for library data, drive status, indexing progress, and UI state.

### Decision
Use Zustand for all frontend state management.

### Rationale
- Lightweight — no boilerplate compared to Redux
- Simple API — easy to understand and maintain for solo developer
- Works well with TypeScript
- Sufficient for the complexity level of this application

### Tradeoffs
- Less structure than Redux (acceptable for solo project)
- No built-in devtools as powerful as Redux DevTools (Zustand has basic devtools support)

### Alternatives Rejected
- **Redux Toolkit:** Overkill for this application size; too much boilerplate
- **React Context only:** Sufficient for simple state but causes unnecessary re-renders at scale
- **Jotai / Recoil:** Smaller communities; less AI tooling familiarity

---

## ADR-010 — Relative Thumbnail Paths for Library Portability

**Status:** Accepted
**Date:** 2026-05-19

### Context
Users may move their library folder to a different location, machine, or drive. Absolute thumbnail paths would break on relocation.

### Decision
Store relative thumbnail paths in the database (e.g. `thumbnails/uuid.webp`). Resolve to absolute paths at runtime using the library root directory as the base.

### Rationale
- Library folder is portable — copy and move without breaking thumbnail references
- Naturally supports future multiple library feature — each library resolves its own thumbnail paths independently
- Simple to implement — one string concatenation at path resolution time
- Consistent with how the library structure is designed

### Tradeoffs
- Slight additional step in path resolution (negligible performance impact)
- All path resolution must go through library root — cannot use raw DB paths directly

---

## ADR-011 — Serialized Indexing (One Job at a Time)

**Status:** Accepted
**Date:** 2026-05-19

### Context
The app must decide whether to allow concurrent indexing jobs across multiple drives simultaneously or serialize them.

### Decision
Only one indexing job may run at a time. If a second job is requested while one is running, the backend returns `INDEXING_IN_PROGRESS`. The user must wait or cancel the current job before starting a new one.

### Rationale
- Indexing is heavily I/O bound; concurrent jobs compete for disk bandwidth and often make both slower
- Significantly simpler cancellation, progress reporting, and error handling
- Content creators typically connect and index one drive at a time in practice
- Reduces risk of database contention during write-heavy indexing operations

### Tradeoffs
- Users with multiple drives connected simultaneously cannot index in parallel
- Slight inconvenience if user wants to index a second drive immediately

### Future Enhancement
Queue-based concurrent indexing is a backlog item for a future version once usage patterns are understood.

---

## ADR-012 — FFmpeg Version Pinning Strategy

**Status:** Accepted
**Date:** 2026-05-19

### Context
FFmpeg must be bundled as a static binary sidecar. A version strategy is needed to ensure consistency, reliability, and maintainability.

### Decision
Pin to the latest stable FFmpeg release at build time. Update the pinned version deliberately with each app release. Use trusted static build sources per platform:

| Platform | Source |
|---|---|
| macOS (x86_64 + ARM64) | evermeet.cx/ffmpeg |
| Windows (x86_64) | gyan.dev/ffmpeg/builds — "release essentials" |
| Linux (x86_64) | johnvansickle.com/ffmpeg — static builds |

### Rationale
- Latest stable release has the best format support and bug fixes
- Static builds have no runtime dependencies — consistent behavior across all user machines
- Pinning prevents unexpected behavior from automatic updates
- Trusted community sources provide well-tested static builds for all platforms
- "Essentials" build on Windows reduces installer size to ~50–70MB

### Tradeoffs
- Requires deliberate FFmpeg update process with each release
- Developer must verify new FFmpeg version before shipping
- Pinned version may lag behind latest for a release cycle

---

## ADR-013 — Thumbnail Dimensions and Quality

**Status:** Accepted
**Date:** 2026-05-19

### Context
Thumbnail images need fixed dimensions and quality settings for MVP. These settings affect storage size, visual quality at render time, and implementation complexity.

### Decision
- Format: WebP lossy
- Max dimension: 320px on longest edge (aspect ratio preserved)
- Quality: 75%
- Settings are fixed for version 1.0.0 — not user-configurable

### Rationale
- 320px provides crisp rendering at standard grid thumbnail sizes (150–200px) on HiDPI/Retina displays at 2x
- WebP quality 75 is visually indistinguishable from higher quality at thumbnail sizes
- Fixed settings eliminate configuration complexity for MVP
- Average file size ~15KB per thumbnail — acceptable at scale
- FFmpeg WebP output flag: `-vf scale=320:-1 -quality 75`

### Storage Estimates
| Assets | Avg Size | Total |
|---|---|---|
| 10,000 | 15KB | ~150MB |
| 100,000 | 15KB | ~1.5GB |
| 500,000 | 15KB | ~7.5GB |

### Tradeoffs
- No user control over thumbnail quality or size in MVP
- Users with very large monitors may prefer larger thumbnails (mitigated by backlog item)

### Future Enhancement
Configurable thumbnail size (small / medium / large) is a backlog item for a future version.

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft — ADR-001 through ADR-010 |
| 1.1 | 2026-05-19 | Updated ADR-003 thumbnail format from JPEG to WebP. Updated ADR-010 path example to .webp. Added ADR-011 (Serialized Indexing), ADR-012 (FFmpeg Version Strategy), ADR-013 (Thumbnail Dimensions and Quality). |
| 1.2 | 2026-05-19 | Revised ADR-004 — removed file size pre-filter; hash computed for every file always; clarified one-sided comparison against stored fingerprint; documented why pre-filter was removed. |
