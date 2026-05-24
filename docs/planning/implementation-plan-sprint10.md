# Implementation Plan — Sprint 10

**Version:** 1.0  
**Date:** 2026-05-22  
**Sprint:** 10 — Tags, Asset Metadata, and Transcription

---

## Milestones

| Milestone | Scope | Est. Complexity |
|---|---|---|
| 10A | Tags — backend + UI | Medium |
| 10B | Asset metadata fields — Description + Location | Low |
| 10C | Transcription — model management + settings | High |
| 10D | Transcription — options dialog + background job | High |
| 10E | Transcription — display, click-to-seek, search | Medium |

---

## Milestone 10A — Tags

### Backend
- [ ] Verify `tags` and `asset_tags` tables exist (migration 001 — already done)
- [ ] Add `tag_list` command — returns all tags ordered by name
- [ ] Add `tag_create` command — creates tag, returns Tag
- [ ] Add `tag_delete` command — deletes tag and all asset_tag associations
- [ ] Add `asset_tag_add` command — adds tag to asset
- [ ] Add `asset_tag_remove` command — removes tag from asset
- [ ] Add `asset_tags_set` command — replaces all tags for asset in one call
- [ ] Extend `asset_search` to support `tag_ids` filter (already in filters struct)
- [ ] Register all new commands in `lib.rs`

### Frontend
- [ ] Add `tags.ts` command wrappers
- [ ] Add `tagStore.ts` — Zustand store for tag list
- [ ] Build `TagPicker` component — dropdown, shows all tags, supports inline creation
- [ ] Build `TagBadge` component — small pill display
- [ ] Update `AssetDetailView` — add Tags section with TagPicker
- [ ] Update `FilterPanel` — add Tags filter section
- [ ] Update `libraryStore` — pass tag_ids to search filters

### Acceptance Criteria
- User can create a tag from the asset detail pane
- User can apply multiple tags to an asset
- User can remove a tag from an asset
- Tags persist after closing and reopening asset
- Library filter panel shows all existing tags as checkboxes
- Filtering by tag shows only assets with that tag

---

## Milestone 10B — Asset Metadata Fields

### Backend
- [ ] Add `settings_get_asset_metadata` command — bulk fetch all description/location values
- [ ] Extend `asset_search` to search description and location fields when query present
- [ ] Register new commands in `lib.rs`

### Frontend
- [ ] Add `getAssetMetadata()` to `commands/settings.ts`
- [ ] Update `libraryStore` — load metadata map alongside asset names
- [ ] Update `AssetDetailView` — add Description textarea and Location input below Asset Name
- [ ] Both fields: click to edit, blur/Enter to save, Escape to cancel
- [ ] Description: multi-line, auto-expanding textarea
- [ ] Location: single-line input

### Acceptance Criteria
- Description and Location fields visible in asset detail pane
- Values persist across sessions
- Search bar finds assets by description and location content

---

## Milestone 10C — Model Management

### Backend
- [ ] Add migration 003 — `transcripts` table + `transcript_fts` FTS5 virtual table
- [ ] Add `model_list` command — scans models directory, returns installed models with size
- [ ] Add `model_download` command — downloads model with progress events
- [ ] Add `model_delete` command — removes model files from disk
- [ ] Implement model directory resolution — `~/Library/Application Support/media-asset-manager/models/`

### Frontend
- [ ] Add Models section to `SettingsView`
- [ ] Show available models table: name, size, status (installed/not installed)
- [ ] Download button with progress bar per model
- [ ] Delete button for installed models
- [ ] Toast on download complete / error

### Acceptance Criteria
- Settings shows available and installed models
- User can download a model with visible progress
- User can delete an installed model
- If no model installed and transcription attempted — informative message shown

---

## Milestone 10D — Transcription Job

### Backend
- [ ] Add `transcribe.py` sidecar script — faster-whisper implementation
- [ ] Add `transcribe_whisper.py` sidecar script — Whisper fallback
- [ ] Add Python detection logic — check common macOS Python paths
- [ ] Add `transcription_estimate` command — returns estimated duration
- [ ] Add `transcription_start` command — spawns Python subprocess, streams progress events
- [ ] Add `transcription_cancel` command — kills subprocess
- [ ] Add `transcription_get` command — returns transcript for asset
- [ ] Add `transcription_delete` command — removes transcript
- [ ] Register all commands in `lib.rs`

### Frontend
- [ ] Add `transcriptionStore.ts` — manages active transcription jobs
- [ ] Build `TranscriptionOptionsDialog` — model selector, language, prompt, duration estimate
- [ ] Add "Generate Transcript" button to asset detail pane (video + audio only, online drive only)
- [ ] Wire transcription progress to status bar (extend or second row)
- [ ] Toast on completion and cancellation
- [ ] Handle "no model installed" state gracefully

### Acceptance Criteria
- Generate Transcript button visible for eligible assets
- Options dialog shows model, language, prompt, estimated duration
- Transcription runs in background — user can browse library
- Progress visible in status bar with cancel button
- Toast on completion

---

## Milestone 10E — Transcript Display + Search

### Backend
- [ ] Populate `transcript_fts` on transcript save
- [ ] Extend `asset_search` to JOIN `transcript_fts` and search transcript content
- [ ] Add `transcript_fts` triggers for update and delete

### Frontend
- [ ] Build `TranscriptPanel` component — scrollable segment list
- [ ] Each segment: timestamp + text, clickable to seek video
- [ ] Highlight active segment as video plays (based on currentMs)
- [ ] "Copy transcript" button — copies plain text to clipboard
- [ ] "Re-transcribe" button replaces "Generate Transcript" when transcript exists
- [ ] Update library search to surface transcript matches

### Acceptance Criteria
- Transcript visible in asset detail pane as timestamped segments
- Clicking segment seeks video to correct position
- Active segment highlighted during playback
- Search bar returns assets with matching transcript content
- Re-transcribe replaces existing transcript

---

## Dependencies and Sequencing

```
10A (Tags) → independent, start first
10B (Metadata) → independent, can run in parallel with 10A
10C (Model Management) → must complete before 10D
10D (Transcription Job) → depends on 10C
10E (Display + Search) → depends on 10D
```

---

## Technical Risks

| Risk | Mitigation |
|---|---|
| Python not found on user's Mac | Clear error message in UI with setup instructions; check Homebrew, system, pyenv paths |
| faster-whisper not installed | Settings screen shows setup instructions; fallback to Whisper if installed |
| Model download interrupted | Implement resumable download; partial files cleaned up on failure |
| Transcription takes too long | Progress bar + cancel; duration estimate in dialog |
| FTS5 query performance on large libraries | FTS5 is highly optimised; index only on commit, not per-segment |
