# Functional Requirements — Sprint 10

**Version:** 1.0  
**Date:** 2026-05-22  
**Sprint:** 10 — Tags, Asset Metadata, and Transcription

---

## FR-200 — Tag Management

### FR-201 — Create Tag
- The user shall be able to create a named tag from the asset detail pane
- Tag names shall be trimmed of leading/trailing whitespace
- Duplicate tag names (case-insensitive) shall not be permitted
- Tags shall be stored in the existing `tags` table

### FR-202 — Apply Tag to Asset
- The user shall be able to apply one or more tags to an asset from the asset detail pane
- The tag picker shall display all existing tags
- The user shall be able to create a new tag inline within the tag picker
- Applied tags shall be displayed in the asset detail pane

### FR-203 — Remove Tag from Asset
- The user shall be able to remove a tag from an asset
- Removing a tag from an asset shall not delete the tag itself

### FR-204 — Filter by Tag
- The filter panel in the library view shall include a Tags section
- The user shall be able to filter assets by one or more tags
- Multiple selected tags shall use AND logic (asset must have all selected tags)
- Tag filters shall be combinable with existing filters (type, drive, status)

---

## FR-210 — Asset Metadata Fields

### FR-211 — Description Field
- The asset detail pane shall include a Description field
- Description shall be a multi-line free-form text area
- Description shall persist across sessions
- Description content shall be searchable via the library search bar

### FR-212 — Location Field
- The asset detail pane shall include a Location field
- Location shall be a single-line text field
- Location shall persist across sessions
- Location content shall be searchable via the library search bar

### FR-213 — Storage
- Description and Location shall be stored in the `settings` table using keys:
  - `asset_description:<asset_id>`
  - `asset_location:<asset_id>`
- A bulk-fetch command shall retrieve all descriptions and locations in a single query

---

## FR-220 — Transcription

### FR-221 — Engine
- The app shall use **faster-whisper** as the primary transcription engine
- **Whisper** (OpenAI original) shall be supported as a fallback alternative
- The engine shall run entirely on-device — no internet connection required for transcription

### FR-222 — Model Management
- Models shall be stored in `~/Library/Application Support/media-asset-manager/models/`
- The Settings screen shall include a Models section showing:
  - Currently installed models
  - Available models to download (tiny, base, small, medium, large)
  - Model size before download
  - Download button with progress indicator per model
  - Delete button for installed models
- On first transcription attempt with no model installed, a message shall inform the user a model must be downloaded and direct them to Settings
- Future: user shall be able to point the app to an existing model installation on their computer

### FR-223 — Generate Transcript Button
- A "Generate Transcript" button shall appear in the asset detail pane for video and audio assets
- The button shall only be visible when the asset's drive is online
- If no model is installed, the button shall be disabled with a tooltip: "No model installed — see Settings"
- If a transcript already exists, the button label shall be "Re-transcribe"

### FR-224 — Transcription Options Dialog
When the user clicks Generate Transcript, a dialog shall appear containing:

1. **Asset info** — filename, duration, and an estimated transcription time based on selected model and asset duration
2. **Model selector** — dropdown listing only installed models; user selects which model to use
3. **Language selector** — dropdown with common languages plus "Auto-detect"; default is Auto-detect
4. **Initial prompt** — optional text field; passed to the engine as context to improve accuracy (e.g. proper nouns, domain vocabulary)
5. **Confirmation** — "Start Transcription" button and Cancel button

### FR-225 — Background Transcription
- Transcription shall run as a background process
- A status bar (same pattern as indexing) shall show:
  - Spinner and "Transcribing…" label
  - Asset name being transcribed
  - Percentage progress where available
  - Cancel button
- The user shall be able to navigate freely while transcription runs
- On completion, a toast notification shall appear: "Transcript ready — [asset name]"
- On cancellation, a toast shall appear: "Transcription cancelled"

### FR-226 — Transcript Display
- Completed transcripts shall appear in a scrollable section in the asset detail pane
- Transcripts shall be displayed as timestamped segments, e.g.:
  ```
  [00:12]  Hello and welcome to the tour.
  [00:18]  On your left you can see the harbour.
  ```
- Each segment shall be clickable — clicking seeks the video player to that timestamp
- The currently playing segment shall be highlighted as the video plays
- A "Copy transcript" button shall copy the full plain text to clipboard

### FR-227 — Transcript Storage
- Transcripts shall be stored in a new `transcripts` table in SQLite:
  ```sql
  CREATE TABLE transcripts (
    id           TEXT PRIMARY KEY,
    asset_id     TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    engine       TEXT NOT NULL,
    model        TEXT NOT NULL,
    language     TEXT,
    detected_lang TEXT,
    segments     TEXT NOT NULL,  -- JSON array: [{start_ms, end_ms, text}]
    created_at   INTEGER NOT NULL,
    duration_ms  INTEGER
  );
  ```
- A full-text search index (`FTS5`) shall index transcript segment text
- Transcripts shall be searchable via the library search bar
- Re-transcription shall replace the existing transcript for that asset

### FR-228 — Search Integration
- The library search bar shall search transcript content in addition to filenames
- Assets with matching transcript content shall appear in search results
- Transcript search shall be combined with existing search filters

---

## Out of Scope (Future)

- Automatic transcription on index
- Batch transcription of multiple assets
- Export transcript as SRT, VTT, or TXT file
- Speaker diarisation (identifying who is speaking)
- User-configurable model storage location (backlog)
- Translation (transcribe in source language, translate to another)
