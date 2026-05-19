# Architecture Decision Records — Media Asset Manager

> Version: 1.0
> Status: Draft
> Stage: 3 — Architecture & Technical Design
> Last Updated: 2026-05-19

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

## ADR-003 — Thumbnails Stored as Files on Disk

**Status:** Accepted
**Date:** 2026-05-19

### Context
Thumbnail images must be generated and displayed for video and image assets. The storage location affects database size, query performance, and portability.

### Decision
Store thumbnails as JPEG files in a `thumbnails/` subdirectory co-located with `library.db`. Store relative paths in the database.

### Rationale
- Keeps SQLite database lean and fast
- Relative paths maintain portability — the library folder can be moved without breaking references
- Tauri can serve local files directly to the webview via asset protocol
- Thumbnails can be purged independently without affecting the database
- Each library has its own `thumbnails/` folder, naturally isolating thumbnails when multiple libraries are supported in future

### Tradeoffs
- Two artifacts to manage (database + thumbnails folder)
- Manual deletion of thumbnails folder creates orphaned path references in DB (mitigated by placeholder fallback and future regeneration feature)

### Alternatives Rejected
- **SQLite BLOBs:** Acceptable for small libraries; poor performance at 100K+ assets; complex Tauri bridge rendering pipeline

---

## ADR-004 — Partial Hash Fingerprinting for Duplicate Detection

**Status:** Accepted
**Date:** 2026-05-19

### Context
Media assets (especially video files up to 25GB+) may exist on multiple drives. Duplicate detection must be reliable without making indexing impractically slow.

### Decision
Compute a SHA256 fingerprint using:
- Files > 128KB: SHA256(first 64KB + last 64KB)
- Files ≤ 128KB: SHA256(entire file)

Use file size as a pre-filter — only compute fingerprints for files that share a size with an existing indexed asset.

### Rationale
- Reads at most 128KB regardless of file size (e.g. 128KB from a 25GB video)
- Reliable in practice for media files — camera-generated files have unique timestamps in headers
- File size pre-filter avoids hashing most files entirely
- Straightforward to implement in Rust

### Tradeoffs
- Theoretical false positive if two files share size AND first/last 64KB content (extremely unlikely for real media files)
- Not suitable for detecting files that have been modified (intentional — modified files should be new assets)

### Alternatives Rejected
- **Full SHA256:** Impractical — 3–8 minutes per 25GB file
- **Filename + size only:** Too many false positives (e.g. multiple files named `IMG_0001.MP4`)

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
- Increases installer size (FFmpeg binary is ~50–80MB per platform)
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
Store relative thumbnail paths in the database (e.g. `thumbnails/uuid.jpg`). Resolve to absolute paths at runtime using the library root directory as the base.

### Rationale
- Library folder is portable — copy and move without breaking thumbnail references
- Naturally supports future multiple library feature — each library resolves its own thumbnail paths independently
- Simple to implement — one string concatenation at path resolution time
- Consistent with how the library structure is designed

### Tradeoffs
- Slight additional step in path resolution (negligible performance impact)
- All path resolution must go through library root — cannot use raw DB paths directly

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft — ADR-001 through ADR-010 created during SDLC Stage 3 |
