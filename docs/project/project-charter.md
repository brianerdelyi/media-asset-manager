# Project Charter — Media Asset Manager

> Version: 1.0
> Status: Draft
> Stage: 1 — Project Definition
> Last Updated: 2026-05-19

---

## 1. Project Overview

**Project Name:** Media Asset Manager
**Project Type:** Cross-platform desktop application
**Development Model:** Solo developer, AI-assisted

Media Asset Manager (MAM) is a local desktop application that enables content creators to index, tag, and search media assets stored on removable drives or network shares. The application maintains a persistent local index so that assets remain searchable even when the source drive is offline.

---

## 2. Problem Statement

Content creators — videographers, photographers, and audio producers — accumulate hundreds of hours of footage and thousands of media files across multiple removable drives and network shares. When a drive is disconnected, there is no way to browse, search, or locate specific assets without physically reconnecting the drive.

Existing tools either require drives to be connected, are cloud-dependent, are too complex for solo use, or are not cross-platform. There is no lightweight, local, offline-capable media indexing tool designed for individual content creators.

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

---

## 4. Non-Goals (MVP)

| ID | Non-Goal |
|---|---|
| NG-01 | No multi-user or collaboration features |
| NG-02 | No cloud storage or cloud sync |
| NG-03 | No video playback or editing |
| NG-04 | No integration with external editing tools (DaVinci Resolve, CapCut, etc.) |
| NG-05 | No document indexing (PDF, project files) |
| NG-06 | No transcoding or media conversion |
| NG-07 | No mobile platform support |

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

---

## 6. High-Level Feature List

| ID | Feature | Priority |
|---|---|---|
| F-01 | Drive/folder registration and management | MVP |
| F-02 | Media asset indexing (video, image, audio) | MVP |
| F-03 | Metadata extraction (filename, size, duration, resolution, date) | MVP |
| F-04 | Tag creation and assignment | MVP |
| F-05 | Full-text and filtered search across index | MVP |
| F-06 | Offline-capable index (SQLite, local) | MVP |
| F-07 | Thumbnail/preview generation (user-toggleable) | MVP |
| F-08 | Drive online/offline status indicator | MVP |
| F-09 | Asset detail view | MVP |
| F-10 | Collection/album grouping | Future |
| F-11 | Editor integration (send clip to editor) | Future |
| F-12 | Document indexing | Future |
| F-13 | Duplicate detection | Future |
| F-14 | Batch tagging | Future |

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

---

## 9. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | Tauri ecosystem immaturity for specific features | Medium | High | Evaluate during Stage 3; Electron fallback identified |
| R-02 | FFmpeg licensing or bundling complexity | Medium | Medium | Evaluate alternative libraries; make it optional |
| R-03 | Large drive indexing performance | Medium | High | Implement background indexing with progress feedback |
| R-04 | Cross-platform file path inconsistencies | High | Medium | Normalize all paths at ingestion; test on all platforms |
| R-05 | SQLite file corruption on improper app shutdown | Low | High | Use WAL mode; implement safe shutdown procedures |
| R-06 | Thumbnail storage growing too large | Medium | Medium | Store thumbnails in compressed format; allow purge |

---

## 10. Recommended Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| App Shell | Tauri 2.x | Lightweight, cross-platform, Rust backend, smaller binary than Electron |
| Frontend | React 18+ with TypeScript | Mature ecosystem, strong component libraries, good AI tooling support |
| Styling | Tailwind CSS | Utility-first, fast iteration, no design system needed for solo dev |
| Database | SQLite via `rusqlite` (Rust) | Embedded, reliable, offline-first, ideal for local indexing |
| Media Metadata | FFmpeg (via sidecar) or `mediainfo` | Industry standard for metadata extraction across all media types |
| Thumbnail Generation | FFmpeg (frame extraction for video) | Same tool as metadata; can be toggled off |
| State Management | Zustand or React Context | Lightweight; avoid Redux complexity for solo project |
| Build/Package | Tauri bundler | Native installers for all three platforms |

**Note:** If Tauri presents blocking issues during Stage 3 or Stage 5, Electron is the identified fallback. This decision will be revisited in the Architecture stage.

---

## 11. Stakeholders

| Role | Name |
|---|---|
| Product Owner | Brian (user) |
| Developer | Brian (user) + AI-assisted tooling |
| End User | Solo content creators |

---

## 12. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft created during SDLC Stage 1 |
