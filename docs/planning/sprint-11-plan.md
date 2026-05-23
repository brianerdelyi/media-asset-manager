# Sprint 11 — Transcription Foundation

**Version:** 1.1
**Date:** 2026-05-22
**Status:** Ready to begin
**Branch:** `dev`
**Updated:** Replaced faster-whisper with whisper.cpp (whisper-cli)

---

## Goal

Build the complete transcription infrastructure — database schema, whisper-cli
integration, model download/management in Settings, and the background
transcription engine. No transcript display UI yet — this sprint ends with a
working transcription job that saves timestamped segments to the database.

---

## Engine: whisper-cli

Binary: `/opt/homebrew/bin/whisper-cli` (dev) / bundled sidecar (production)
Input: WAV audio — FFmpeg extracts audio from video before transcribing
Output: JSON with `offsets.from` / `offsets.to` in milliseconds

---

## Milestones

| Milestone | Scope |
|---|---|
| 11A | Database migration 003 — transcripts + FTS5 |
| 11B | whisper-cli detection and validation |
| 11C | Model management — download, list, delete |
| 11D | Transcription engine — background job, progress, cancel |

---

## 11A — Database Migration

**Update: `src-tauri/src/db/migrations.rs`**

- [ ] Add `migration_004_transcripts` (note: 003 was drive_media_types):
  ```sql
  CREATE TABLE transcripts (
    id            TEXT PRIMARY KEY,
    asset_id      TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    engine        TEXT NOT NULL DEFAULT 'whisper.cpp',
    model         TEXT NOT NULL,
    language      TEXT,
    detected_lang TEXT,
    segments      TEXT NOT NULL,
    created_at    INTEGER NOT NULL,
    duration_ms   INTEGER
  );
  CREATE VIRTUAL TABLE transcript_fts USING fts5(...);
  -- plus insert/delete/update triggers
  ```
- [ ] Register migration in `run()`

### Acceptance Criteria
- [ ] App starts without error after migration
- [ ] `transcripts` table exists
- [ ] `transcript_fts` virtual table exists

---

## 11B — whisper-cli Detection

**New file: `src-tauri/src/transcription/engine.rs`**

- [ ] `find_whisper_cli()` — searches in order:
  1. `/opt/homebrew/bin/whisper-cli` (Apple Silicon Homebrew)
  2. `/usr/local/bin/whisper-cli` (Intel Homebrew)
  3. `whisper-cli` (PATH fallback)
- [ ] `check_whisper_cli(path)` — runs `whisper-cli --help`, confirms binary works
- [ ] `WhisperStatus` struct: `{ found: bool, path: Option<String>, version: Option<String> }`

**New file: `src-tauri/src/transcription/mod.rs`**
- [ ] `resolve_models_path()` — `~/Library/Application Support/media-asset-manager/models/`
- [ ] `pub mod engine; pub mod models; pub mod job;`

**New command: `transcription_check_environment()`**
- [ ] Returns `WhisperStatus`
- [ ] Called by Settings screen to show environment status

### Acceptance Criteria
- [ ] Command correctly finds whisper-cli at Homebrew path
- [ ] Returns clear status when not found

---

## 11C — Model Management

### Model definitions (hardcoded in Rust)
```rust
pub struct ModelDef {
    pub name: &'static str,      // "tiny", "base", "small", "medium", "large-v3"
    pub filename: &'static str,  // "ggml-tiny.bin"
    pub size_bytes: u64,
    pub url: &'static str,       // HuggingFace URL
    pub rtf: f32,                // real-time factor for estimation
}
```

**New file: `src-tauri/src/transcription/models.rs`**
- [ ] Define all 5 model entries with sizes and URLs
- [ ] `list_installed_models(models_dir)` — scans dir, returns `Vec<ModelInfo>`
- [ ] `ModelInfo` struct: `{ name, filename, size_bytes, installed, path, rtf }`

**New commands:**
- [ ] `model_list()` → `Vec<ModelInfo>` — all available, marks installed
- [ ] `model_delete(model_name)` → removes `.bin` file from models dir
- [ ] `model_download(app_handle, model_name)` — downloads with progress events:
  - Streams `model:download:progress { model_name, percent, bytes_downloaded, total_bytes }`
  - On complete: `model:download:complete { model_name }`
  - On error: `model:download:error { model_name, error }`
  - Cleans up partial file on failure or cancellation

**Frontend: `src/commands/transcription.ts`**
- [ ] `checkEnvironment()` → `WhisperStatus`
- [ ] `listModels()` → `ModelInfo[]`
- [ ] `deleteModel(name)` → `void`
- [ ] `downloadModel(name)` — fires and forgets (progress via events)

**Frontend: `src/stores/transcriptionStore.ts`**
- [ ] `models: ModelInfo[]`, `fetchModels()`
- [ ] `activeDownloads: Record<string, number>` — name → percent
- [ ] `whisperStatus: WhisperStatus | null`
- [ ] Event listeners for download progress and complete events

**Frontend: Settings screen — new Transcription section**
- [ ] Environment status — whisper-cli found/not found with path
- [ ] If not found: instructions (`brew install whisper-cpp`)
- [ ] Models table: Name, Size, Status (Installed/Available), Actions
- [ ] Download button per uninstalled model — shows progress bar while downloading
- [ ] Delete button per installed model
- [ ] Toast on download complete / error

### Acceptance Criteria
- [ ] Settings shows whisper-cli status with path
- [ ] Available models listed with correct sizes
- [ ] Download with progress bar works
- [ ] Delete removes model file
- [ ] Partial downloads cleaned up on failure

---

## 11D — Transcription Engine

**New file: `src-tauri/src/transcription/job.rs`**

- [ ] `TranscriptionState` — manages active subprocess handles for cancel
  ```rust
  pub struct TranscriptionState {
      active_jobs: Mutex<HashMap<String, Arc<Mutex<Option<Child>>>>>,
  }
  ```

- [ ] `transcription_start` command:
  1. Validate asset exists, location is online
  2. Validate model file exists at models path
  3. Look up asset file path from locations table
  4. Generate temp WAV path: `/tmp/mam_<job_id>.wav`
  5. Run FFmpeg to extract audio:
     `ffmpeg -i <asset_path> -ar 16000 -ac 1 -f wav <tmp>.wav`
  6. Run whisper-cli:
     `whisper-cli -m <model> -f <tmp>.wav --language <lang> --prompt "<prompt>" --output-json -of <tmp_output>`
  7. Emit `transcription:progress` events based on elapsed time estimate
  8. Parse output JSON — map `offsets.from/to` to `start_ms/end_ms`, trim text
  9. Save transcript record to database
  10. Populate `transcript_fts`
  11. Emit `transcription:complete`
  12. Clean up temp WAV and JSON files

- [ ] `transcription_cancel` command — kills subprocess, emits `transcription:cancelled`
- [ ] `transcription_get` command → `Option<Transcript>`
- [ ] `transcription_delete` command → removes record and FTS entry
- [ ] `transcription_estimate` command → `{ estimated_seconds: u64 }`
  - Looks up asset `duration_ms`, multiplies by model RTF

**Update: `src-tauri/src/lib.rs`**
- [ ] `.manage(TranscriptionState::new())`
- [ ] Register all new commands

### Acceptance Criteria
- [ ] `transcription_start` produces a transcript saved to the database
- [ ] Segments have correct `start_ms` and `end_ms` in milliseconds
- [ ] Text is trimmed (no leading spaces)
- [ ] Cancel kills the subprocess
- [ ] `transcription_get` returns the saved transcript
- [ ] Temp files are cleaned up after completion
- [ ] Error surfaces cleanly if whisper-cli not found or model missing

---

## Definition of Done

- Migration applies on startup without errors
- whisper-cli detection works on dev machine
- Model download and delete work in Settings
- Transcription start/cancel/get commands functional
- JSON parsing produces correct segments
- No TypeScript errors (`tsc` clean)
- Committed to `dev` with descriptive messages

---

## Estimated Complexity

| Task | Complexity |
|---|---|
| Migration | Low |
| whisper-cli detection | Low |
| Model management backend | Medium |
| Model management UI in Settings | Medium |
| Transcription job — FFmpeg + whisper-cli pipeline | High |
| Subprocess management + cancel | High |
| JSON parsing + DB save | Low |

**Overall: High — 4–6 days estimated**
