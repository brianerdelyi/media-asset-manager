# TODO

> Last updated: 2026-05-22 — v0.9.0 Preview

---

## Current Status

**Version:** 0.9.0 Preview  
**Branch:** `dev`  
**Platform:** macOS ARM64  

Sprints 1–9 complete. Sprint 10A and 10B complete. Sprint 11 ready to begin.

---

## Sprint 10 — Tags, Asset Metadata, and Transcription

### 10A — Tags ✅ Complete
### 10B — Asset Metadata Fields ✅ Complete

### 10C — Model Management (Sprint 11)
- [ ] Migration 004 — `transcripts` table + `transcript_fts` FTS5 index
- [ ] `model_list`, `model_download`, `model_delete` commands
- [ ] Models section in Settings — download/delete with progress
- [ ] Model storage: `~/Library/Application Support/media-asset-manager/models/`
- [ ] whisper-cli environment detection

### 10D — Transcription Job (Sprint 11)
- [ ] whisper-cli integration — FFmpeg audio extraction + transcription pipeline
- [ ] `transcription_start`, `transcription_cancel`, `transcription_get`, `transcription_delete` commands
- [ ] `transcription_estimate` command — estimated duration based on model RTF
- [ ] `TranscriptionOptionsDialog` — model, language, prompt, duration estimate
- [ ] "Generate Transcript" button in asset detail pane
- [ ] Background transcription with status bar progress and cancel
- [ ] Toast on completion and cancellation
- [ ] "No model installed" state handling

### 10E — Transcript Display + Search (Sprint 12)
- [ ] `TranscriptPanel` — scrollable timestamped segments
- [ ] Click segment → seek video to timestamp
- [ ] Highlight active segment during playback
- [ ] "Copy transcript" button
- [ ] "Re-transcribe" button when transcript exists
- [ ] Extend library search to query `transcript_fts`

### 10F — Release Candidate (1.0.0)
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
  Depends on: transcription feature complete (Sprint 11/12).

- [ ] **Filter panel — dynamic faceted counts (Option B)** — update filter
  option counts dynamically as filters change. Currently Option A (static
  total counts). Deferred — consider for post-1.0.0.

- [ ] **Keyword Auto-Marking** — after transcription, scan transcript for
  user-defined keywords and automatically create markers at those timestamps.
  - **Keyword** — a named phrase spoken during recording (e.g. "mark video")
  - Multiple keywords supported; each has a name and trigger phrase
  - Managed in Settings as a named list
  - Auto-Marking triggered manually or automatically on transcription completion
  - Generated markers named **"Auto-Marker #"** in chronological order
  - Auto-Markers identical to manual markers — editable, deletable, exportable
  - Future: fuzzy matching for near-matches
  - Depends on: transcription complete (Sprint 11/12)

- [ ] **Transcoded clip export** — H.264/HEVC via macOS VideoToolbox (LGPL-compatible)
- [ ] **LGPL FFmpeg bundling** — remove Homebrew FFmpeg dependency
- [ ] **whisper-cli bundling** — remove Homebrew whisper-cpp dependency
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
- `pnpm tauri icon` not yet run — app icon uses placeholder

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
