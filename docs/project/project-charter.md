# Project Charter — Media Asset Manager

> Version: 1.1
> Status: Revised
> Stage: 1 — Project Definition
> Last Updated: 2026-05-19
> Change: Added video playback, scrubbing, and markers to MVP scope. Added lossless clip export to backlog. Updated terminology to use SemVer versioning. Removed video playback from non-goals.

---

## 1. Project Overview

**Project Name:** Media Asset Manager
**Project Type:** Cross-platform desktop application
**Development Model:** Solo developer, AI-assisted

Media Asset Manager (MAM) is a local desktop application that enables content creators to index, tag, and search media assets stored on removable drives or network shares. The application maintains a persistent local index so that assets remain searchable even when the source drive is offline. Users can preview video assets, scrub through timelines, and create named markers and in/out clip points directly within the app.

---

## 2. Problem Statement

Content creators — videographers, photographers, and audio producers — accumulate hundreds of hours of footage and thousands of media files across multiple removable drives and network shares. When a drive is disconnected, there is no way to browse, search, or locate specific assets without physically reconnecting the drive.

Existing tools either require drives to be connected, are cloud-dependent, are too complex for solo use, or are not cross-platform. There is no lightweight, local, offline-capable media indexing tool designed for individual content creators that also supports in-app preview and marker-based clip identification.

---

## 3. Goals

| ID | Goal |
|---|---|
| G-01 | Allow users to index media assets from removable drives and network shares |
| G-02 | Allow users to tag assets with custom metadata |
| G-03 | Allow users to search the index when drives are offline |
| G-04 | Generate optional thumbnail/preview images during indexing |
| G-05 | Run natively on Windows, macOS, and Linux |
| G-06 | Keep the application fast, local, and privacy-respecting (no cloud dependency) |
| G-07 | Allow users to preview video assets and scrub through timelines in-app |
| G-08 | Allow users to create named markers and in/out clip points on video assets |

---

## 4. Non-Goals (Version 1.0.0)

| ID | Non-Goal |
|---|---|
| NG-01 | No multi-user or collaboration features |
| NG-02 | No cloud storage or cloud sync |
| NG-03 | No integration with external editing tools (DaVinci Resolve, CapCut, etc.) |
| NG-04 | No document indexing (PDF, project files) |
| NG-05 | No transcoding or media conversion |
| NG-06 | No mobile platform support |
| NG-07 | No advanced playback controls (speed, frame stepping) — basic playback only |
| NG-08 | No lossless clip export — backlog item, version TBD |
| NG-09 | No FFmpeg proxy playback for unsupported formats — backlog item, version TBD |

---

## 5. Success Criteria

| ID | Criterion |
|---|---|
| SC-01 | User can connect a drive and index all media assets within it |
| SC-02 | User can search for assets by filename, tag, type, or date when the drive is offline |
| SC-03 | User can add, edit, and remove tags on any indexed asset |
| SC-04 | Thumbnails are generated for video and image assets when the option is enabled |
| SC-05 | Application runs without errors on Windows 10+, macOS 12+, and Ubuntu 22.04+ |
| SC-06 | Indexing a drive of 1,000 files completes in under 5 minutes on average hardware |
| SC-07 | Application starts in under 3 seconds on average hardware |
| SC-08 | User can play and scrub through natively supported video formats in-app |
| SC-09 | User can create, name, and manage markers and in/out clip points on video assets |

---

## 6. High-Level Feature List

| ID | Feature | Version |
|---|---|---|
| F-01 | Drive/folder registration and management | 1.0.0 |
| F-02 | Media asset indexing (video, image, audio) | 1.0.0 |
| F-03 | Metadata extraction (filename, size, duration, resolution, date) | 1.0.0 |
| F-04 | Tag creation and assignment | 1.0.0 |
| F-05 | Full-text and filtered search across index | 1.0.0 |
| F-06 | Offline-capable index (SQLite, local) | 1.0.0 |
| F-07 | Thumbnail/preview generation (user-toggleable) | 1.0.0 |
| F-08 | Drive online/offline status indicator | 1.0.0 |
| F-09 | Asset detail view | 1.0.0 |
| F-10 | Basic in-app video playback and scrubbing | 1.0.0 |
| F-11 | Markers — single point and in/out clip markers per asset | 1.0.0 |
| F-12 | Collection/album grouping | Backlog |
| F-13 | Lossless clip export (stream copy at in/out points) | Backlog |
| F-14 | FFmpeg proxy playback for unsupported formats | Backlog |
| F-15 | Advanced playback controls (speed, frame stepping, volume) | Backlog |
| F-16 | Editor integration (send clip to editor) | Backlog |
| F-17 | Document indexing | Backlog |
| F-18 | Duplicate detection | Backlog |
| F-19 | Batch tagging | Backlog |
| F-20 | Multiple library support | Backlog |
| F-21 | Hierarchical tags | Backlog |

---

## 7. Constraints

| ID | Constraint |
|---|---|
| C-01 | Must run entirely offline with no cloud dependency |
| C-02 | Must support Windows 10+, macOS 12+, Ubuntu 22.04+ |
| C-03 | Solo developer with AI-assisted tooling |
| C-04 | Tauri + React as the primary technology stack (subject to Stage 3 confirmation) |
| C-05 | SQLite as the local database |
| C-06 | MVP scope limited to video, image, and audio assets |
| C-07 | No collaboration or sharing features in MVP |
| C-08 | In-app video playback limited to formats natively supported by OS webview |
| C-09 | All asset metadata, tags, and markers stored in local database only — never written back to media files |

---

## 8. Assumptions

| ID | Assumption |
|---|---|
| A-01 | Users manage their own drives and file organization |
| A-02 | Assets are stored in standard file formats (MP4, MOV, JPG, PNG, WAV, etc.) |
| A-03 | Users have basic technical ability to install a desktop application |
| A-04 | Average drive size is between 500GB and 8TB |
| A-05 | Thumbnail generation will use available system libraries (FFmpeg or similar) |
| A-06 | The app database is stored in the OS-appropriate app data directory |
| A-07 | Network shares behave similarly to local drives for indexing purposes |
| A-08 | Most common video formats will be H.264/MP4 and H.265/MP4 |
| A-09 | H.264/MP4 will play reliably across all three platforms via native webview |
| A-10 | H.265/MP4 may not play on all platforms — external player fallback covers this gap |

---

## 9. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | Tauri ecosystem immaturity for specific features | Medium | High | Evaluate during Stage 3; Electron fallback identified |
| R-02 | FFmpeg licensing or bundling complexity | Medium | Medium | Required for thumbnails; evaluate library options in Stage 3 |
| R-03 | Large drive indexing performance | Medium | High | Background indexing with progress feedback |
| R-04 | Cross-platform file path inconsistencies | High | Medium | Normalize all paths at ingestion; test on all platforms |
| R-05 | SQLite file corruption on improper app shutdown | Low | High | WAL mode; safe shutdown procedures |
| R-06 | Thumbnail storage growing too large | Medium | Medium | Compressed format; allow purge |
| R-07 | H.265/MP4 not playing on Windows or Linux webview | High | Medium | Show "Open in external player" fallback for unsupported formats |
| R-08 | MOV and MKV containers not supported in webview | High | Medium | Same fallback as R-07; document known limitations |
| R-09 | Scrubbing performance on large video files | Medium | Medium | Use native HTML5 seek; evaluate performance in Stage 5 |

---

## 10. Recommended Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| App Shell | Tauri 2.x | Lightweight, cross-platform, Rust backend, smaller binary than Electron |
| Frontend | React 18+ with TypeScript | Mature ecosystem, strong AI tooling support |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Database | SQLite via `rusqlite` (Rust) | Embedded, reliable, offline-first |
| Media Metadata | FFmpeg (via sidecar) or `mediainfo` | Industry standard metadata extraction |
| Thumbnail Generation | FFmpeg (frame extraction for video) | Same tool as metadata; toggleable |
| Video Playback | HTML5 `<video>` element (native webview) | Built-in; no extra dependencies for MVP |
| State Management | Zustand or React Context | Lightweight; avoid Redux complexity |
| Build/Package | Tauri bundler | Native installers for all three platforms |

---

## 11. Versioning Convention

This project follows Semantic Versioning (SemVer): **Major.Minor.Patch**

| Segment | When to increment |
|---|---|
| Major | Significant new feature sets or breaking changes |
| Minor | New backward-compatible features |
| Patch | Bug fixes and small corrections |

| Version | Meaning |
|---|---|
| `0.1.0` | First development build |
| `0.x.0` | Pre-release development iterations |
| `1.0.0` | MVP release |
| `1.x.x` | Post-MVP iterations |
| `2.0.0` | Major future expansion |

---

## 12. Stakeholders

| Role | Name |
|---|---|
| Product Owner | Brian |
| Developer | Brian + AI-assisted tooling |
| End User | Solo content creators |

---

## 13. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Added video playback, scrubbing, and markers to MVP scope. Added lossless clip export, FFmpeg proxy playback, and advanced controls to backlog. Updated non-goals. Added risks R-07, R-08, R-09. Added SemVer convention. Updated terminology throughout. |
