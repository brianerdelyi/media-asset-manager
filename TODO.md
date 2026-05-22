# TODO

> Last updated: 2026-05-22 — v0.9.0 Preview

---

## Current Status

**Version:** 0.9.0 Preview  
**Branch:** `dev`  
**Platform:** macOS ARM64  

Sprints 1–9 complete. App is feature-complete for preview. Sprint 10 planned.

---

## Sprint 10 — Tags, Asset Metadata, and Transcription

### 10A — Tags
- [ ] `tag_list`, `tag_create`, `tag_delete` Rust commands
- [ ] `asset_tag_add`, `asset_tag_remove`, `asset_tags_set` Rust commands
- [ ] Extend `asset_search` to filter by `tag_ids`
- [ ] `tagStore.ts` Zustand store
- [ ] `TagPicker` component — inline tag selection and creation
- [ ] `TagBadge` component
- [ ] Asset detail pane — Tags section with TagPicker
- [ ] Filter panel — Tags filter section

### 10B — Asset Metadata Fields
- [ ] `settings_get_asset_metadata` bulk fetch command
- [ ] Extend `asset_search` to search description and location
- [ ] Description textarea in asset detail pane
- [ ] Location input in asset detail pane
- [ ] Both fields editable, persist via settings table, searchable

### 10C — Model Management
- [ ] Migration 003 — `transcripts` table + `transcript_fts` FTS5 index
- [ ] `model_list`, `model_download`, `model_delete` commands
- [ ] Models section in Settings — download/delete with progress
- [ ] Model storage: `~/Library/Application Support/media-asset-manager/models/`

### 10D — Transcription Job
- [ ] `transcribe.py` sidecar — faster-whisper implementation
- [ ] `transcribe_whisper.py` sidecar — Whisper fallback
- [ ] Python environment detection (Homebrew, system, pyenv)
- [ ] `transcription_start`, `transcription_cancel`, `transcription_get`, `transcription_delete` commands
- [ ] `transcription_estimate` command — estimated duration
- [ ] `TranscriptionOptionsDialog` — model, language, prompt, estimate
- [ ] "Generate Transcript" button in asset detail pane
- [ ] Background transcription with status bar progress and cancel
- [ ] Toast on completion and cancellation
- [ ] "No model installed" state handling

### 10E — Transcript Display + Search
- [ ] `TranscriptPanel` — scrollable timestamped segments
- [ ] Click segment → seek video to timestamp
- [ ] Highlight active segment during playback
- [ ] "Copy transcript" button
- [ ] "Re-transcribe" button when transcript exists
- [ ] Extend library search to query `transcript_fts`

### 10F — Release Candidate (1.0.0)
- [ ] Bundle LGPL FFmpeg binary — remove Homebrew dependency
- [ ] Universal binary build (ARM64 + Intel)
- [ ] Apple notarization
- [ ] About dialog — version, attribution, FFmpeg licence notice
- [ ] README update — installation, screenshots, requirements
- [ ] Final smoke test on clean macOS install
- [ ] Tag and release v1.0.0

---

## Backlog — Features

- [ ] **Cue Word Auto-Marking** — after transcription, scan transcript for user-defined cue words
  (e.g. "mark video") and automatically create markers at those timestamps.
  - Cue words are managed in Settings as a named list (e.g. name: "Film Marker", phrase: "mark video")
  - Multiple cue words supported
  - Auto-marking can be triggered manually after transcription or optionally run automatically on transcription completion
  - Generated markers are named: cue word name + sequence number (e.g. "Film Marker 1", "Film Marker 2")
  - Markers created are identical to manually created markers — editable, deletable, exportable as clips
  - Fuzzy matching option (future) to catch near-matches e.g. "mark the video"
  - Depends on: transcription feature (Sprint 10D/10E)

- [ ] **Transcoded clip export** — H.264/HEVC via macOS VideoToolbox (LGPL-compatible)
- [ ] **LGPL FFmpeg bundling** — remove Homebrew dependency (moved to Sprint 10F)
- [ ] Tag management screen — rename and delete tags globally
- [ ] Batch export — export multiple clips in one operation
- [ ] Collection / project grouping
- [ ] EDL / CSV marker export
- [ ] Windows and Linux support
- [ ] Universal binary (moved to Sprint 10F)
- [ ] User-configurable model storage location (transcription)
- [ ] Export transcript as SRT, VTT, or TXT
- [ ] Transcript speaker diarisation

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
