# Sprint 12 — Transcription UI, Display, and Search

**Version:** 1.0
**Date:** 2026-05-22
**Status:** Planned — begins after Sprint 11 approval
**Branch:** `dev`

---

## Goal

Build the complete user-facing transcription experience — the options dialog, Generate Transcript button, transcript display with timestamped segments, click-to-seek, active segment highlighting, and search integration. This sprint makes transcription visible and usable.

---

## Scope

| Milestone | Scope |
|---|---|
| 12A | Transcription options dialog + Generate Transcript button |
| 12B | Transcript display — segments, click-to-seek, active highlighting |
| 12C | Search integration — transcript content searchable via search bar |
| 12D | Version bump + release candidate 1.0.0 |

---

## Prerequisites

- Sprint 11 complete ✅
- `transcription_start`, `transcription_get`, `transcription_estimate` commands working ✅
- At least one model installed ✅

---

## 12A — Options Dialog + Generate Transcript Button

### Frontend Tasks

**New file: `src/components/detail/TranscriptionOptionsDialog.tsx`**

Dialog shown when user clicks "Generate Transcript". Contains:

- [ ] **Asset info row** — filename + duration (from asset)
- [ ] **Estimated time row** — calls `transcription_estimate(asset_id, model)` when model changes; displays "~30 seconds" or "~4 minutes"
- [ ] **Model selector** — dropdown listing only installed models (from `transcriptionStore.models` where `installed === true`); disabled with message "No models installed — see Settings" if none
- [ ] **Language selector** — dropdown:
  - First option: "Auto-detect"
  - Common languages: English, French, Spanish, German, Italian, Portuguese, Japanese, Korean, Chinese (Simplified), Arabic, Hindi
  - All 99 Whisper-supported languages available in a scrollable list
- [ ] **Initial prompt** — optional text input with placeholder "e.g. GoPro, DJI, proper nouns…"; label explains it helps accuracy
- [ ] **Start Transcription** button — disabled if no model selected
- [ ] **Cancel** button

**Update: `src/components/detail/AssetDetailView.tsx`**

- [ ] Add **Generate Transcript** button to right panel, in a new Transcript section
  - Visible for video and audio assets only
  - Visible only when drive is online
  - Disabled with tooltip "No model installed — see Settings" when `transcriptionStore.models` has no installed models
  - Label changes to "Re-transcribe" when transcript exists for this asset
- [ ] On click — opens `TranscriptionOptionsDialog`
- [ ] On dialog confirm — calls `transcriptionStore.startTranscription()`

**Update: `src/stores/transcriptionStore.ts`**

- [ ] `startTranscription(assetId, model, language, prompt)` — calls `transcription_start`, stores `{ jobId, assetId }` as `activeJob`
- [ ] `cancelTranscription()` — calls `transcription_cancel`
- [ ] Event listeners in `App.tsx`:
  - `transcription:progress` → update `activeJob.percent`
  - `transcription:complete` → clear job, refresh asset detail, toast "Transcript ready — [filename]"
  - `transcription:cancelled` → clear job, toast "Transcription cancelled"
  - `transcription:error` → clear job, toast error message (persistent)

**Update: `src/components/indexing/IndexingProgress.tsx`** (or new `TranscriptionProgress.tsx`)
- [ ] Add second row to status bar for active transcription job
  - Shows spinner + "Transcribing [filename]…" + percent + Cancel button
  - Tracks sidebar width (same pattern as indexing bar)
  - Auto-dismisses 3 seconds after completion

### Acceptance Criteria

- [ ] Generate Transcript button visible for video/audio assets on online drives
- [ ] Button disabled when no model installed, tooltip explains why
- [ ] Options dialog shows filename, duration, estimated time
- [ ] Estimated time updates when model selection changes
- [ ] Language selector includes Auto-detect + common languages
- [ ] Prompt field accepts free text
- [ ] Start Transcription triggers background job
- [ ] Progress visible in status bar
- [ ] Cancel stops transcription
- [ ] Toast on completion and cancellation
- [ ] Button label changes to "Re-transcribe" when transcript exists

---

## 12B — Transcript Display

**New file: `src/components/detail/TranscriptPanel.tsx`**

- [ ] Shown in asset detail right panel when transcript exists
- [ ] Displays `engine` + `model` + `detected_lang` as a small header (e.g. "faster-whisper · small · English")
- [ ] Scrollable list of segments:
  ```
  [00:12]  Hello and welcome to the tour.
  [00:18]  On your left you can see the harbour.
  ```
- [ ] Each segment is a button — clicking calls `onSeek(segment.start_ms)`
- [ ] Active segment highlighted — matches `currentMs` from video player
  - Active segment: `background: var(--color-accent-subtle)`, `color: var(--text-primary)`
  - Inactive segments: `color: var(--text-secondary)`
  - Active segment auto-scrolls into view as video plays
- [ ] **Copy** button at top of panel — copies full plain text (no timestamps) to clipboard; toast "Transcript copied"
- [ ] Timestamps formatted as `MM:SS` (or `HH:MM:SS` for videos > 1 hour)

**Update: `src/commands/transcription.ts`**
- [ ] Add `getTranscript(assetId)` → `Transcript | null`

**Update: `src/components/detail/AssetDetailView.tsx`**
- [ ] Load transcript on asset open via `transcription_get(asset_id)`
- [ ] If transcript exists — show `TranscriptPanel` in right panel below Markers
- [ ] Pass `currentMs` to `TranscriptPanel` for active segment highlighting
- [ ] Wire `onSeek` to `videoRef.current?.seekTo(ms)`
- [ ] On transcription complete event — reload transcript for current asset if IDs match

### Acceptance Criteria

- [ ] Transcript appears in right panel after transcription completes
- [ ] Segments displayed with timestamps
- [ ] Clicking a segment seeks video to correct position
- [ ] Active segment highlighted as video plays
- [ ] Active segment scrolls into view automatically
- [ ] Copy button copies plain text transcript to clipboard
- [ ] Engine, model, and language shown in header
- [ ] Transcript loads correctly on re-opening asset

---

## 12C — Search Integration

### Backend Tasks

**Update: `src-tauri/src/assets/mod.rs`**
- [ ] Extend `search_assets` — when `query` present, use FTS5 to find matching `asset_id` values from `transcript_fts`:
  ```sql
  LEFT JOIN (
    SELECT asset_id FROM transcript_fts WHERE transcript_fts MATCH ?
  ) tf ON tf.asset_id = a.id
  ```
- [ ] Asset appears in results if filename OR description OR location OR transcript matches
- [ ] Existing filters (type, drive, tags) still applied

### Frontend Tasks

- [ ] No UI changes required — search bar already passes `query` to `searchAssets`
- [ ] Add `has_transcript` to `AssetSummary` (optional, future use for filter)

### Acceptance Criteria

- [ ] Searching a word spoken in a video returns that asset
- [ ] Transcript search combines correctly with type/drive/tag filters
- [ ] Assets with no transcript are not excluded from non-transcript searches

---

## 12D — Release Candidate 1.0.0

- [ ] Version bump to `1.0.0` in `package.json`, `Cargo.toml`, `tauri.conf.json`
- [ ] Run `pnpm tauri icon /tmp/mam_icon.png` — apply final app icon
- [ ] Run `pnpm update` — update frontend dependencies
- [ ] Run `cargo update` — update Rust crate patches
- [ ] Full smoke test against `docs/testing/smoke-test-v0.9.0.md`
- [ ] Write `docs/testing/smoke-test-v1.0.0.md` — add transcription test cases
- [ ] Update `CHANGELOG.md`
- [ ] `pnpm tauri build --target universal-apple-darwin` — universal binary
- [ ] Upload DMG to GitHub release via `gh release create v1.0.0`
- [ ] Update GitHub Pages site — add transcription feature to features section

### Acceptance Criteria

- [ ] App builds cleanly as universal binary
- [ ] All smoke test items pass
- [ ] DMG available on GitHub releases page
- [ ] GitHub Pages site reflects 1.0.0

---

## Definition of Done

- All acceptance criteria across 12A, 12B, 12C pass
- No TypeScript errors
- No hardcoded Tailwind colour classes introduced
- App builds cleanly (`pnpm tauri build`)
- Committed and tagged `v1.0.0`

---

## Estimated Complexity

| Task | Complexity |
|---|---|
| TranscriptionOptionsDialog | Medium |
| Generate Transcript button + state | Low |
| Transcription status bar row | Low |
| TranscriptPanel component | Medium |
| Active segment highlighting + auto-scroll | Medium |
| Copy transcript button | Low |
| Search integration (FTS5 JOIN) | Medium |
| 1.0.0 release build | Low |

**Overall: Medium — 3–4 days estimated**

---

## Out of Scope for This Sprint

- Keyword Auto-Marking (backlog — depends on this sprint completing)
- Export transcript as SRT/VTT/TXT (backlog)
- Speaker diarisation (backlog)
- Transcoded clip export (backlog)
- LGPL FFmpeg bundling (backlog)
