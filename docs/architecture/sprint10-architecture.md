# Architecture Notes — Sprint 10

**Version:** 1.0  
**Date:** 2026-05-22  
**Sprint:** 10 — Tags, Asset Metadata, and Transcription

---

## 1. Tag System

### Database
Tags and asset_tags tables already exist in migration 001. No schema changes required.

### New Tauri Commands
```
tag_list()                          → Vec<Tag>
tag_create(name: String)            → Tag
tag_delete(tag_id: String)          → ()
asset_tag_add(asset_id, tag_id)     → ()
asset_tag_remove(asset_id, tag_id)  → ()
asset_tags_set(asset_id, tag_ids)   → ()   // replace all tags in one call
```

### Frontend Components
- `TagPicker` — inline dropdown in asset detail pane; shows existing tags, allows inline creation
- `TagBadge` — small pill shown in asset detail and optionally on asset cards
- `FilterPanel` — add Tags section with checkboxes for each existing tag

---

## 2. Asset Metadata Fields

### Storage
Stored in the existing `settings` table using prefixed keys:
- `asset_description:<asset_id>`
- `asset_location:<asset_id>`

Bulk fetch command retrieves all values matching a prefix in one query — same pattern as `settings_get_asset_names`.

### New Tauri Commands
```
settings_get_asset_metadata()   → HashMap<String, AssetMetadata>
  // returns { asset_id: { description, location } }
```

### Search Integration
The `asset_search` query in `assets/mod.rs` shall be extended to JOIN the settings table and search description/location values when a query string is present.

### Frontend
- `AssetDetailView` right panel — Description textarea and Location input below Asset Name
- `libraryStore` — extend `assetNames` pattern to also load descriptions and locations
- `AssetCard` — no change required (description/location not shown on card)

---

## 3. Transcription Architecture

### Engine: faster-whisper

faster-whisper is a Python package. On macOS it requires Python 3.8+ and the `faster-whisper` pip package. Rather than shipping a bundled Python runtime (complex, large), the app will:

1. Check for Python 3 at common macOS paths
2. Check for `faster-whisper` package installation
3. If not found, provide setup instructions in Settings
4. Run transcription via `std::process::Command` calling a Python script sidecar

**Sidecar script:** `src-tauri/scripts/transcribe.py`  
Called as: `python3 transcribe.py --model <path> --audio <path> --language <lang> --prompt <text> --output-json`

Outputs JSON to stdout:
```json
{
  "language": "en",
  "segments": [
    { "start": 0.0, "end": 3.2, "text": "Hello and welcome." },
    ...
  ]
}
```

Progress is emitted to stderr as plain percentage lines: `10\n20\n...` which the Rust process reads and emits as Tauri events.

**Whisper fallback:** identical interface, different Python import (`import whisper` vs `from faster_whisper import WhisperModel`). Selected in Settings.

### Model Storage
```
~/Library/Application Support/media-asset-manager/models/
  faster-whisper-tiny/
  faster-whisper-base/
  faster-whisper-small/
  whisper-tiny.pt
  whisper-base.pt
```

Models downloaded via the app using `reqwest` (already available via Tauri's HTTP client) with progress events.

### Database — Migration 003
```sql
CREATE TABLE transcripts (
  id            TEXT PRIMARY KEY,
  asset_id      TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  engine        TEXT NOT NULL,   -- 'faster-whisper' | 'whisper'
  model         TEXT NOT NULL,   -- 'tiny' | 'base' | 'small' | 'medium' | 'large'
  language      TEXT,            -- requested language or 'auto'
  detected_lang TEXT,            -- language detected by model
  segments      TEXT NOT NULL,   -- JSON: [{start_ms, end_ms, text}]
  created_at    INTEGER NOT NULL,
  duration_ms   INTEGER
);

CREATE VIRTUAL TABLE transcript_fts USING fts5(
  asset_id UNINDEXED,
  text,
  content=transcripts,
  tokenize='porter ascii'
);
```

FTS5 triggers keep the index in sync with the transcripts table automatically.

### New Tauri Commands
```
transcription_start(asset_id, model, language, prompt)  → { job_id }
transcription_cancel(job_id)                             → bool
transcription_get(asset_id)                             → Option<Transcript>
transcription_delete(asset_id)                          → ()
model_list()                                            → Vec<ModelInfo>
model_download(model_name)                              → { job_id }  (streams progress events)
model_delete(model_name)                                → ()
transcription_estimate(asset_id, model)                 → { estimated_seconds }
```

### Tauri Events
```
transcription:progress   { job_id, asset_id, percent }
transcription:complete   { job_id, asset_id }
transcription:error      { job_id, asset_id, error }
transcription:cancelled  { job_id, asset_id }
model:download:progress  { model_name, percent, bytes_downloaded, total_bytes }
model:download:complete  { model_name }
```

### Estimated Duration Calculation
Based on empirical benchmarks for Apple Silicon M-series:

| Model  | Real-time factor (approx) |
|--------|--------------------------|
| tiny   | 0.05× (20× faster than real-time) |
| base   | 0.10× |
| small  | 0.25× |
| medium | 0.60× |
| large  | 1.20× |

`estimated_seconds = asset_duration_seconds × real_time_factor`

Displayed in the options dialog as e.g. "~45 seconds" for a 3-minute clip on small.

### Frontend Components
- `TranscriptPanel` — scrollable segment list in asset detail right panel; highlights active segment during playback
- `TranscriptionOptionsDialog` — modal with model selector, language, prompt, duration estimate, start/cancel
- `ModelSettingsSection` — in Settings screen; lists models, download/delete actions
- `TranscriptionProgress` — extends existing status bar or adds second row
- `TranscriptSegment` — individual clickable segment with timestamp

### Search Extension
`asset_search` Rust function extended to:
1. JOIN `transcript_fts` when query string present
2. Return assets where filename OR description OR location OR transcript matches query
3. Highlight match source in result (future enhancement)

---

## 4. Open Questions / Risks

| # | Question | Risk |
|---|----------|------|
| 1 | faster-whisper requires Python — not guaranteed on all Macs | Medium — need graceful fallback and clear setup instructions |
| 2 | Model download sizes (500MB–3GB) need reliable resumable download | Medium — use chunked download with resume support |
| 3 | Transcription progress from Python subprocess is approximate | Low — percentage based on segment count, not exact |
| 4 | FTS5 index size for large libraries | Low — text only, typically small relative to media |
| 5 | Python path resolution across macOS versions and Homebrew vs system Python | Medium — must check multiple paths |
