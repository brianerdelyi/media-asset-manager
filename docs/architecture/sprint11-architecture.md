# Architecture Notes — Sprint 11

**Version:** 1.1
**Date:** 2026-05-22
**Sprint:** 11 — Transcription Foundation
**Updated:** Replaced faster-whisper with whisper.cpp (whisper-cli)

---

## 1. Engine: whisper.cpp

whisper.cpp is a C++ port of OpenAI's Whisper model. It is installed via Homebrew
as `whisper-cli` and distributed as a compiled binary sidecar alongside the app.
No Python runtime is required on the user's machine.

### Why whisper.cpp over faster-whisper
- No Python dependency — single binary sidecar, same pattern as FFmpeg
- Cross-platform: macOS ARM64, macOS Intel, Windows, Linux
- Metal GPU acceleration on Apple Silicon (confirmed working)
- Supports `--prompt` for initial prompt / hallucination suppression
- Simple CLI interface — easy to call from Rust via `std::process::Command`

### Confirmed CLI flags
```bash
whisper-cli \
  -m <model_path>          # GGML model file (.bin)
  -f <audio_path>          # WAV audio file (required — not MP4)
  --language <lang|auto>   # Language code or auto-detect
  --prompt "<text>"        # Initial prompt for context/accuracy
  --output-json            # Output JSON format
  -of <output_path>        # Output file path (without extension)
```

### Confirmed JSON output format
```json
{
  "result": { "language": "en" },
  "transcription": [
    {
      "timestamps": { "from": "00:00:00,000", "to": "00:00:05,000" },
      "offsets": { "from": 0, "to": 5000 },
      "text": " Hello world."
    }
  ]
}
```

Key fields:
- `result.language` — detected or specified language
- `transcription[].offsets.from` — start time in milliseconds
- `transcription[].offsets.to` — end time in milliseconds
- `transcription[].text` — transcribed text (leading space — trim on parse)

### Audio pipeline
whisper-cli requires WAV format input. Video files must be converted first:
```bash
ffmpeg -i <video.mp4> -ar 16000 -ac 1 -f wav <audio.wav>
```
FFmpeg is already a dependency — no additional tools required.

---

## 2. Model Management

### Available models
| Name | Size | Speed (M1 tiny) | Quality |
|---|---|---|---|
| tiny | 75 MB | ~7× real-time | Basic |
| base | 150 MB | ~4× real-time | Good |
| small | 500 MB | ~2× real-time | Better |
| medium | 1.5 GB | ~1× real-time | High |
| large-v3 | 3.1 GB | ~0.5× real-time | Best |

### Model source
GGML model files downloaded from:
`https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-<size>.bin`

### Model storage
`~/Library/Application Support/media-asset-manager/models/`

Example:
```
models/
  ggml-tiny.bin
  ggml-base.bin
  ggml-small.bin
```

### Duration estimation (real-time factors on M1)
| Model | RTF | 10 min video → estimate |
|---|---|---|
| tiny | 0.14× | ~1.4 min |
| base | 0.25× | ~2.5 min |
| small | 0.50× | ~5 min |
| medium | 1.00× | ~10 min |
| large-v3 | 2.00× | ~20 min |

---

## 3. Database — Migration 003

```sql
CREATE TABLE transcripts (
  id            TEXT PRIMARY KEY,
  asset_id      TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  engine        TEXT NOT NULL DEFAULT 'whisper.cpp',
  model         TEXT NOT NULL,   -- 'tiny' | 'base' | 'small' | 'medium' | 'large-v3'
  language      TEXT,            -- requested: 'en', 'auto', etc.
  detected_lang TEXT,            -- language detected by model
  segments      TEXT NOT NULL,   -- JSON: [{start_ms, end_ms, text}]
  created_at    INTEGER NOT NULL,
  duration_ms   INTEGER
);

CREATE VIRTUAL TABLE transcript_fts USING fts5(
  asset_id UNINDEXED,
  text,
  content='transcripts',
  tokenize='porter ascii'
);

-- FTS triggers to keep index in sync
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

Segments stored as JSON array:
```json
[{"start_ms": 0, "end_ms": 5000, "text": "Hello world."}]
```

---

## 4. Transcription Pipeline (Rust)

```
User clicks "Generate Transcript"
  → TranscriptionOptionsDialog (model, language, prompt)
  → transcription_start command
    → Validate asset exists and drive is online
    → Validate model file exists
    → FFmpeg: extract WAV audio to temp file
        ffmpeg -i <asset_path> -ar 16000 -ac 1 -f wav <tmp>.wav
    → whisper-cli: transcribe
        whisper-cli -m <model> -f <tmp>.wav
          --language <lang> --prompt "<prompt>"
          --output-json -of <tmp_output>
    → Parse JSON output
    → Map offsets.from/to → start_ms/end_ms, trim text
    → Save to transcripts table
    → Populate transcript_fts
    → Emit transcription:complete event
    → Clean up temp WAV and JSON files
```

### Rust subprocess management
```rust
pub struct TranscriptionState {
    active_jobs: Mutex<HashMap<String, Arc<Mutex<Option<Child>>>>>,
}
```

Progress is emitted as Tauri events based on whisper-cli stderr output.
whisper-cli does not emit percentage progress natively — progress is
estimated based on elapsed time vs expected duration.

---

## 5. Tauri Events

```
transcription:progress   { job_id, asset_id, percent: u8 }
transcription:complete   { job_id, asset_id }
transcription:error      { job_id, asset_id, error: String }
transcription:cancelled  { job_id, asset_id }
model:download:progress  { model_name, percent, bytes_downloaded, total_bytes }
model:download:complete  { model_name }
model:download:error     { model_name, error }
```

---

## 6. New Tauri Commands

```
// Model management
model_list()                                    → Vec<ModelInfo>
model_download(app_handle, model_name)          → ()  // streams progress events
model_delete(model_name)                        → ()

// Transcription
transcription_start(asset_id, model, language, prompt) → { job_id }
transcription_cancel(job_id)                    → bool
transcription_get(asset_id)                     → Option<Transcript>
transcription_delete(asset_id)                  → ()
transcription_estimate(asset_id, model)         → { estimated_seconds: u64 }
```

---

## 7. Open Questions / Risks

| # | Question | Risk | Mitigation |
|---|---|---|---|
| 1 | whisper-cli not in PATH after Homebrew install | Medium | Search common paths: `/opt/homebrew/bin/whisper-cli`, `/usr/local/bin/whisper-cli` |
| 2 | whisper-cli binary not bundled — requires Homebrew in dev | Medium | Dev uses Homebrew; production bundles binary as sidecar |
| 3 | Temp WAV file disk usage for large videos | Low | Extract only needed segment; clean up immediately after |
| 4 | No native progress percentage from whisper-cli | Low | Estimate from elapsed time; show spinner with time estimate |
| 5 | Model download interrupted | Low | Resumable download with partial file cleanup on failure |
| 6 | FTS5 search performance on large libraries | Low | FTS5 is optimised; index only full text not per-segment |
