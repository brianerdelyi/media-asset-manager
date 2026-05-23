# TODO

> Last updated: 2026-05-23 — v0.9.1 dev

---

## Current Status

**Version:** 0.9.1 dev
**Branch:** `dev`
**Platform:** macOS ARM64

Sprints 1–12 complete. Transcription foundation and UI fully working.
Next: Sprint 13 — UI polish pass, then 1.0.0 release candidate.

---

## Sprint 13 — 1.0.0 Release Candidate

- [ ] Bundle LGPL FFmpeg binary — remove Homebrew dependency
- [ ] Bundle whisper-cli binary — remove Homebrew dependency for transcription
- [ ] Universal binary build (ARM64 + Intel)
- [ ] Apple notarization
- [ ] About dialog — version, attribution, FFmpeg and whisper.cpp licence notices
- [ ] README update — installation, screenshots, requirements
- [ ] Final smoke test on clean macOS install
- [ ] Tag and release v1.0.0

---

## Backlog — Features

- [ ] **Transcription Profiles** — named, reusable transcription settings.
  Users define profiles (e.g. "Field Recording", "Interview", "GoPro")
  with preset model, language, and initial prompt. Selected from the
  TranscriptionOptionsDialog instead of re-entering settings each time.
  Profiles stored in the `settings` table. Managed in Settings screen.

- [ ] **Keyword Auto-Marking** — after transcription, scan transcript for
  user-defined keywords and automatically create markers at those timestamps.
  - Keyword phrases managed in Settings (e.g. "mark video")
  - Generated markers named "Auto-Marker #" in chronological order
  - Identical to manual markers — editable, deletable, exportable
  - Depends on: transcription complete ✅

- [ ] **Filter panel — dynamic faceted counts (Option B)** — counts update
  as filters change. Currently Option A (static totals). Post-1.0.0.

- [ ] **Transcoded clip export** — H.264/HEVC via macOS VideoToolbox
- [ ] Tag management screen — rename and delete tags globally
- [ ] Batch export — export multiple clips in one operation
- [ ] Collection / project grouping
- [ ] EDL / CSV marker export
- [ ] Export transcript as SRT, VTT, or TXT
- [ ] Transcript speaker diarisation
- [ ] Windows and Linux support
- [ ] Universal binary (ARM64 + Intel)
- [ ] User-configurable model storage location

---

## Backlog — UI / UX

- [ ] Asset card — right-click context menu (Open, Show in Finder, Delete)
- [ ] Keyboard shortcuts — Space to play/pause, J/K/L shuttle
- [ ] Drag-and-drop drive registration
- [ ] Waveform display for audio assets
- [ ] Grid / list view toggle in library

---

## Backlog — Technical

- [ ] Git LFS for FFmpeg binary
- [ ] TypeScript strict mode
- [ ] Unit tests for Rust commands
- [ ] Error boundary in React
- [ ] Structured logging to file

---

## Known Issues

- FFmpeg binary exceeds GitHub's recommended 50 MB file size limit
- App requires Homebrew FFmpeg until LGPL binary is bundled
- App requires Homebrew whisper-cpp until sidecar binary is bundled
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
- [x] Sprint 10A — Tags — backend + UI (Notion/Linear pattern)
- [x] Sprint 10B — Asset metadata fields — Description + Location
- [x] Sprint 11 — Transcription foundation: whisper-cli, model management, DB migration
- [x] Sprint 12 — Transcription UI: options dialog, transcript panel, progress bar,
                   delete transcript, real progress from stdout timestamps, search integration
