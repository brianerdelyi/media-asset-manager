# Sprint 11 — Transcription Foundation

**Version:** 1.0
**Date:** 2026-05-22
**Status:** Planned — begins after Sprint 10 approval
**Branch:** `dev`

---

## Goal

Establish the complete transcription infrastructure — database schema, Python environment detection, model download/management, and the background transcription engine. No visible transcript UI yet — this sprint ends with a working transcription job that saves to the database.

---

## Scope

| Milestone | Scope |
|---|---|
| 11A | Database migration — transcripts table + FTS5 index |
| 11B | Python environment detection and validation |
| 11C | Model management — download, list, delete |
| 11D | Transcription engine — background job, progress, cancel |

---

## Prerequisites

- Sprint 10 complete ✅
- faster-whisper installed on dev machine: `pip3 install faster-whisper`
- Python 3.8+ available via Homebrew or system

---

## 11A — Database Migration

**Update: `src-tauri/src/db/migrations.rs`**

- [ ] Add `migration_003_transcripts`:
  ```sql
  CREATE TABLE transcripts (
    id            TEXT PRIMARY KEY,
    asset_id      TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    engine        TEXT NOT NULL,
    model         TEXT NOT NULL,
    language      TEXT,
    detected_lang TEXT,
    segments      TEXT NOT NULL,
    created_at    INTEGER NOT NULL,
    duration_ms   INTEGER
  );

  CREATE VIRTUAL TABLE transcript_fts USING fts5(
    asset_id UNINDEXED,
    text,
    content='transcripts',
    tokenize='porter ascii'
  );

  CREATE TRIGGER transcript_fts_insert AFTER INSERT ON transcripts BEGIN
    INSERT INTO transcript_fts(rowid, asset_id, text)
    VALUES (new.rowid, new.asset_id, new.segments);
  END;

  CREATE TRIGGER transcript_fts_delete AFTER DELETE ON transcripts BEGIN
    INSERT INTO transcript_fts(transcript_fts, rowid, asset_id, text)
    VALUES ('delete', old.rowid, old.asset_id, old.segments);
  END;

  CREATE TRIGGER transcript_fts_update AFTER UPDATE ON transcripts BEGIN
    INSERT INTO transcript_fts(transcript_fts, rowid, asset_id, text)
    VALUES ('delete', old.rowid, old.asset_id, old.segments);
    INSERT INTO transcript_fts(rowid, asset_id, text)
    VALUES (new.rowid, new.asset_id, new.segments);
  END;
  ```
- [ ] Register migration 003 in `run()`

### Acceptance Criteria
- [ ] App starts without error after migration
- [ ] `transcripts` table exists in DB
- [ ] `transcript_fts` virtual table exists

---

## 11B — Python Environment Detection

**New file: `src-tauri/src/transcription/python.rs`**

- [ ] `find_python()` — searches in order:
  1. `/opt/homebrew/bin/python3` (Apple Silicon Homebrew)
  2. `/usr/local/bin/python3` (Intel Homebrew)
  3. `~/.pyenv/shims/python3` (pyenv)
  4. `/usr/bin/python3` (system)
  5. `python3` (PATH fallback)
- [ ] `check_faster_whisper(python_path)` — runs `python3 -c "import faster_whisper"`, returns bool
- [ ] `check_whisper(python_path)` — runs `python3 -c "import whisper"`, returns bool
- [ ] `get_environment_status()` → `PythonStatus { python_found, python_path, faster_whisper_available, whisper_available }`

**New file: `src-tauri/src/commands/transcription.rs`**

- [ ] `transcription_check_environment()` → `PythonStatus`
  - Called by Settings screen to show environment status

**Update: `src-tauri/src/lib.rs`**
- [ ] Register `transcription_check_environment`

### Acceptance Criteria
- [ ] Command returns correct Python path on dev machine
- [ ] Command correctly detects faster-whisper presence
- [ ] Returns useful status when Python not found

---

## 11C — Model Management

### Model Definitions

Available models (hardcoded in Rust):

| Name | Engine | Size | Download URL |
|---|---|---|---|
| `faster-whisper-tiny` | faster-whisper | 75 MB | Hugging Face |
| `faster-whisper-base` | faster-whisper | 150 MB | Hugging Face |
| `faster-whisper-small` | faster-whisper | 500 MB | Hugging Face |
| `faster-whisper-medium` | faster-whisper | 1.5 GB | Hugging Face |
| `faster-whisper-large-v3` | faster-whisper | 3.1 GB | Hugging Face |

Models are downloaded from `https://huggingface.co/Systran/faster-whisper-{size}/resolve/main/` as a directory of files.

### Backend Tasks

**Update: `src-tauri/src/transcription/mod.rs`**
- [ ] `resolve_models_path()` — returns `~/Library/Application Support/media-asset-manager/models/`
- [ ] `list_installed_models()` — scans models directory, returns `Vec<ModelInfo>`
- [ ] `ModelInfo` struct: `{ name, engine, size_bytes, installed, path }`

**Update: `src-tauri/src/commands/transcription.rs`**
- [ ] `model_list()` → `Vec<ModelInfo>` — lists all available models, marks installed ones
- [ ] `model_delete(model_name)` → `()` — removes model directory from disk
- [ ] `model_download(app_handle, model_name)` — downloads model files with progress events:
  - Emits `model:download:progress { model_name, percent, bytes_downloaded, total_bytes }`
  - Emits `model:download:complete { model_name }`
  - Emits `model:download:error { model_name, error }`
  - Handles interruption — cleans up partial downloads

**Update: `src-tauri/src/lib.rs`**
- [ ] Register `model_list`, `model_delete`, `model_download`

### Frontend Tasks

**New file: `src/commands/transcription.ts`**
- [ ] `checkEnvironment()` → `PythonStatus`
- [ ] `listModels()` → `ModelInfo[]`
- [ ] `deleteModel(name)` → `void`
- [ ] `downloadModel(name)` — fires and forgets (progress via events)

**New file: `src/stores/transcriptionStore.ts`**
- [ ] `models: ModelInfo[]`
- [ ] `fetchModels()`
- [ ] `activeDownloads: Record<string, number>` — model name → percent
- [ ] `pythonStatus: PythonStatus | null`
- [ ] Event listeners for `model:download:progress` and `model:download:complete`

**Update: `src/components/settings/SettingsView.tsx`**
- [ ] Add **Transcription** section:
  - **Environment status** — Python found/not found, faster-whisper installed/not installed
  - Setup instructions if not found: `pip3 install faster-whisper`
  - **Models** table with columns: Model, Engine, Size, Status, Actions
  - Download button (with progress bar) for uninstalled models
  - Delete button for installed models
  - Toast on download complete / error

### Acceptance Criteria
- [ ] Settings shows Python environment status
- [ ] Settings shows available models with correct sizes and install status
- [ ] Download button triggers model download with visible progress
- [ ] Download completes — model marked as installed
- [ ] Delete removes model — marked as not installed
- [ ] Partial/failed download is cleaned up

---

## 11D — Transcription Engine

**New file: `src-tauri/scripts/transcribe.py`**
```python
# faster-whisper transcription sidecar
# Usage: python3 transcribe.py --model <path> --audio <path>
#                               --language <lang|auto> --prompt <text>
# Output: JSON to stdout
# Progress: percentage lines to stderr (10, 20, 30...)
```
- [ ] Accepts `--model`, `--audio`, `--language`, `--prompt` args
- [ ] Extracts audio from video via faster-whisper's built-in handling
- [ ] Outputs progress to stderr as integer percentages
- [ ] Outputs result JSON to stdout on completion:
  ```json
  { "language": "en", "segments": [{"start": 0.0, "end": 3.2, "text": "..."}] }
  ```
- [ ] Handles errors gracefully — outputs `{"error": "..."}` to stdout

**New file: `src-tauri/scripts/transcribe_whisper.py`**
- [ ] Identical interface, uses `import whisper` instead of `faster_whisper`

**Update: `src-tauri/src/commands/transcription.rs`**
- [ ] `transcription_estimate(asset_id)` — looks up asset duration, returns `{ estimated_seconds }` based on selected model's real-time factor
- [ ] `transcription_start(app_handle, state, asset_id, model_name, language, prompt)`:
  - Validates asset exists and drive is online
  - Validates model is installed
  - Spawns Python subprocess
  - Reads stderr for progress → emits `transcription:progress` events
  - On exit: parses stdout JSON, saves to `transcripts` table
  - Emits `transcription:complete` or `transcription:error`
  - Returns `{ job_id }`
- [ ] `transcription_cancel(job_id)` — kills subprocess, emits `transcription:cancelled`
- [ ] `transcription_get(asset_id)` → `Option<Transcript>`
- [ ] `transcription_delete(asset_id)` → `()`

**New struct: `TranscriptionState`** (similar to `IndexingState`)
- [ ] `active_jobs: Mutex<HashMap<String, ChildProcess>>` — tracks running subprocesses for cancel

**Update: `src-tauri/src/lib.rs`**
- [ ] Add `.manage(TranscriptionState::new())`
- [ ] Register `transcription_estimate`, `transcription_start`, `transcription_cancel`, `transcription_get`, `transcription_delete`

### Acceptance Criteria
- [ ] `transcription_start` produces a transcript saved to the database
- [ ] Progress events emitted during transcription
- [ ] Cancel kills the subprocess and emits cancelled event
- [ ] `transcription_get` returns the saved transcript
- [ ] Error in Python script is surfaced as an error event (not a crash)
- [ ] Transcript segments have correct `start_ms` and `end_ms` values

---

## Definition of Done

- Migration 003 applied on startup without errors
- Python detection works on dev machine
- Model download and delete work in Settings
- Transcription start/cancel/get commands functional
- All acceptance criteria pass
- No TypeScript errors
- Committed to `dev` with descriptive messages

---

## Estimated Complexity

| Task | Complexity |
|---|---|
| Migration 003 | Low |
| Python detection | Low |
| Model management backend | Medium |
| Model management UI in Settings | Medium |
| transcribe.py sidecar | Medium |
| Transcription commands (start/cancel/get) | High |
| TranscriptionState subprocess management | High |

**Overall: High — 4–6 days estimated**

---

## Out of Scope for This Sprint

- Transcript display in asset detail pane (Sprint 12)
- Transcript search (Sprint 12)
- Keyword Auto-Marking (backlog)
- Transcription options dialog (Sprint 12)
- Generate Transcript button (Sprint 12)
