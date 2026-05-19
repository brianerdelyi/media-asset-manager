# Project Roadmap — Media Asset Manager

> Version: 1.1
> Status: Draft
> Stage: 1 — Project Definition
> Last Updated: 2026-05-19

---

## Roadmap Overview

This roadmap reflects a solo developer using AI-assisted tooling. Timelines are indicative and will be refined in Stage 4 (Implementation Planning).

---

## Phase 1 — MVP (Target: v1.0)

**Goal:** Functional offline media indexer with tagging and search.

| Milestone | Description | SDLC Stage |
|---|---|---|
| M1 | Project definition and requirements locked | Stage 1–2 |
| M2 | Architecture and technical design approved | Stage 3 |
| M3 | Implementation plan and task breakdown complete | Stage 4 |
| M4 | Core indexing engine working (background, incremental) | Stage 5 |
| M5 | Tagging and search functional | Stage 5 |
| M6 | Thumbnail generation working (toggleable) | Stage 5 |
| M7 | UI complete (library view, detail view, search, settings) | Stage 5 |
| M8 | Cross-platform testing complete | Stage 6 |
| M9 | Installer build for Windows, macOS, Linux | Stage 7 |
| M10 | v1.0 released | Stage 7 |

---

## Phase 2 — Enhanced Usability (Target: v1.x)

| Feature | Description |
|---|---|
| Batch tagging | Apply tags to multiple selected assets at once |
| Collections / Albums | Group assets into named collections |
| Duplicate detection | Flag likely duplicate files across drives |
| Improved search | Boolean filters, saved searches |
| Hierarchical tags | Parent/child tag relationships (e.g. client/acme/project) |
| Performance improvements | Faster indexing, optimized incremental re-index |
| Multiple library support | Allow user to create and switch between separate libraries |

---

## Phase 3 — Editor Integration (Target: v2.0)

| Feature | Description |
|---|---|
| Send to editor | Open a clip in the user's preferred video editor |
| Clip/segment export | Export a defined segment to file without transcoding |
| Editor profiles | Save preferred editor paths per platform |
| DaVinci Resolve integration | Direct timeline send (if API permits) |
| CapCut integration | Send clip to CapCut project (if API permits) |

---

## Phase 4 — Expanded Asset Types (Target: v2.x)

| Feature | Description |
|---|---|
| Document indexing | PDF, project files, scripts |
| RAW image support | CR3, ARW, NEF and other camera RAW formats |
| Extended audio formats | AIFF, FLAC, OGG, etc. |

---

## Versioning Strategy

| Version | Meaning |
|---|---|
| 0.x | Pre-release / development builds |
| 1.0 | MVP release |
| 1.x | Iterative improvements within MVP scope |
| 2.0 | Major feature expansion (editor integration) |

---

## Key Design Decisions (carried from Stage 1)

| Decision | Choice | Rationale |
|---|---|---|
| Library model | Single library (MVP) | Simplicity; multiple library support planned for v1.x |
| Database location | OS app data dir by default; user-configurable | Follows platform conventions; Tauri app_data_dir() API |
| Tag model | Flat tags (MVP) | Simpler to build and use; hierarchy planned for v1.x |
| Indexing model | Background process, incremental re-index | Required for scale (100K+ assets across dozens of drives) |
| Drive workflow | Register drive → prompt to index → background indexing | Clean UX; does not block the interface |

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft created during SDLC Stage 1 |
| 1.1 | 2026-05-19 | Added multiple library support to Phase 2; added hierarchical tags to Phase 2; added key design decisions table; updated M4 to reflect incremental indexing |
