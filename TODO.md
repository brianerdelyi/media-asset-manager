# TODO

> Last updated: 2026-05-22 — v0.9.0 Preview

---

## Current Status

**Version:** 0.9.0 Preview
**Branch:** `dev`
**Platform:** macOS ARM64

Sprints 1–9 complete. App is feature-complete for preview. Next milestone is 1.0.0.

---

## Sprint 10 — 1.0.0 Release Candidate

- [ ] Bundle LGPL FFmpeg binary — remove Homebrew dependency for end users
- [ ] Universal binary build (ARM64 + Intel) for broad macOS compatibility
- [ ] Apple notarization — remove "unidentified developer" warning on launch
- [ ] About dialog — version number, attribution, FFmpeg licence notice
- [ ] README update — installation instructions, screenshots, requirements
- [ ] Final smoke test on clean macOS install (no Homebrew)
- [ ] Tag and release v1.0.0

---

## Backlog — Features

- [ ] **Transcoded clip export** — export clips encoded to H.264/HEVC using macOS VideoToolbox (LGPL-compatible hardware encoder). Format options: MP4 H.264, MP4 HEVC.
- [ ] **LGPL FFmpeg bundling** — replace Homebrew FFmpeg dependency with bundled LGPL-only static binary. Required for distribution. Enables VideoToolbox encoders for transcoded export.
- [ ] Tag management UI — create, rename, delete tags; bulk-tag assets from library view
- [ ] Batch export — export multiple clips in one operation
- [ ] Search by tag
- [ ] Collection / project grouping — group assets into named collections
- [ ] EDL / CSV marker export — export markers as Edit Decision List or spreadsheet
- [ ] Windows and Linux support
- [ ] Intel Mac binary (x86_64) or universal binary

---

## Backlog — UI / UX

- [ ] Move Add Marker button — currently in right panel header; consider inline in marker list when empty
- [ ] Asset card — right-click context menu (Open, Show in Finder, Delete)
- [ ] Keyboard shortcuts — Space to play/pause, J/K/L shuttle, arrow keys to scrub
- [ ] Drag-and-drop drive registration — drag a folder onto the Drives view to register
- [ ] Waveform display for audio assets
- [ ] Grid / list view toggle in library

---

## Backlog — Technical

- [ ] Git LFS for FFmpeg binary — currently over GitHub's 50 MB recommended limit
- [ ] TypeScript strict mode — enable `strict: true` in tsconfig
- [ ] Unit tests for Rust commands (asset search, marker CRUD, clip export)
- [ ] Error boundary in React — catch and display unexpected frontend errors gracefully
- [ ] Logging — structured Rust logs to file for debugging production issues

---

## Known Issues

- FFmpeg binary in repo exceeds GitHub's recommended 50 MB file size limit (warning on push)
- App requires Homebrew FFmpeg until LGPL binary is bundled
- No Apple notarization — users see "unidentified developer" warning on first launch

---

## Completed Sprints

- [x] Sprint 1 — Project scaffold, Tauri + React + SQLite
- [x] Sprint 2 — Drive registration, macOS volume detection, real-time drive watcher
- [x] Sprint 3 — Background indexing engine, FFmpeg metadata extraction, fingerprinting
- [x] Sprint 4 — Thumbnail generation, asset search and filtering
- [x] Sprint 5 — Asset detail view, video playback, timeline scrubber
- [x] Sprint 6 — Markers (point and range), lossless clip export
- [x] Sprint 7 — Settings screen, toast notifications, indexing status bar
- [x] Sprint 8 — Design system, light/dark mode, sidebar, UI polish, app icon
- [x] Sprint 9 — Version bump, production build, GitHub Pages site, git tagging
