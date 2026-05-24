# Media Asset Manager

A local-first desktop app for indexing, tagging, searching, and transcribing media assets across removable drives. Built for macOS with Tauri, React, and SQLite.

**No cloud. No subscriptions. Your footage stays on your drives.**

---

## Features

### Core
- **Drive management** — Register any external drive or folder. Online/offline status is detected automatically when drives connect and disconnect.
- **Background indexing** — Scans video, image, and audio files using FFmpeg metadata extraction. Generates WebP thumbnails at indexing time.
- **Full-text search** — Search filenames, tags, descriptions, locations, and spoken words in transcripts from a single search bar.
- **Filtering** — Filter by media type, drive, tags, status (orphaned, missing), and whether assets have markers.

### Video
- **Inline playback** — Preview footage directly in the app with a timeline scrubber and marker overlay.
- **Markers** — Add named point and range markers to any video. Markers are stored in SQLite and persist across sessions.
- **Lossless clip export** — Set In and Out points then export a clip using FFmpeg stream copy. Zero re-encoding — original quality, fast export.

### Transcription
- **Local speech-to-text** — Transcribe footage on-device using [whisper.cpp](https://github.com/ggerganov/whisper.cpp) with Metal GPU acceleration. No data leaves your machine.
- **Timestamped segments** — Click any transcript line to jump to that moment in the video. Active segment highlights as the video plays.
- **Transcript search** — Spoken words are indexed in SQLite FTS5 and searchable from the main search bar.
- **Keyword auto-marking** — Say a keyword phrase during recording (e.g. "mark video"). After transcription, the app scans the transcript and automatically creates a point marker at every timestamp where the phrase appears.

### Organisation
- **Tags** — Create and apply tags across assets. Filter by one or more tags.
- **Asset metadata** — Add custom name, description, and location to any asset.
- **Light and dark mode** — Follows macOS system appearance, or override in Settings.

---

## Requirements

- macOS 12 or later (Apple Silicon recommended)
- [FFmpeg](https://ffmpeg.org/) — for indexing, thumbnails, and clip export
- [whisper-cpp](https://github.com/ggerganov/whisper.cpp) — for transcription (optional)

Install both via Homebrew:

```bash
brew install ffmpeg whisper-cpp
```

---

## Installation

Download the latest `.dmg` from [Releases](https://github.com/brianerdelyi/media-asset-manager/releases), open it, and drag the app to your Applications folder.

> **Note:** The app is not yet notarised. On first launch, right-click the app and choose Open to bypass the Gatekeeper warning.

---

## Getting Started

1. Launch the app and go to **Drives** in the sidebar
2. Click **Register Drive** and select a folder or external drive
3. Click **Index** to scan for media files
4. Browse, search, and filter your library from the **Library** view

### Transcription setup

1. Go to **Settings → Transcription**
2. Confirm whisper-cli is detected
3. Download a model (Tiny is fast; use Small or Medium for better accuracy)
4. Open any video or audio asset and click **Generate Transcript**

### Keyword auto-marking setup

1. Go to **Settings → Keyword Auto-Marking**
2. Set your keyword phrase (default: `mark video`) and marker label (default: `Auto-Mark`)
3. While recording, say your keyword phrase at any moment you want to mark
4. After transcription, click **Auto-Mark from Transcript** in the asset detail pane — or check **Run Auto-Marking after transcription** in the transcription dialog

---

## Tech Stack

| Layer | Technology |
|---|---|
| App framework | [Tauri 2](https://tauri.app) |
| Backend | Rust |
| Frontend | React 19 + TypeScript |
| Database | SQLite (WAL mode, FTS5) |
| Bundler | Vite 7 |
| State | Zustand 5 |
| Media processing | FFmpeg 8 |
| Transcription | whisper.cpp 1.8 |

Tauri uses the macOS system WebView instead of bundling Chromium — the installed app is under 10 MB and launches in under a second.

---

## Building from Source

```bash
# Prerequisites: Rust, Node.js 18+, pnpm

git clone https://github.com/brianerdelyi/media-asset-manager.git
cd media-asset-manager

pnpm install
pnpm tauri dev       # development build with hot reload
pnpm tauri build     # production build → src-tauri/target/release/bundle/
```

---

## Project Structure

```
src/                     # React frontend
  commands/              # Tauri command wrappers
  components/            # UI components
  stores/                # Zustand state stores
  types/                 # TypeScript types
src-tauri/               # Rust backend
  src/
    assets/              # Asset search and management
    automark/            # Keyword auto-marking engine
    commands/            # Tauri command handlers
    db/                  # SQLite connection and migrations
    drives/              # Drive registration and watcher
    indexer/             # Background indexing engine
    transcription/       # whisper.cpp pipeline
docs/                    # GitHub Pages site
```

---

## Roadmap

- [ ] Bundle FFmpeg and whisper-cli as sidecars (remove Homebrew dependency)
- [ ] Universal binary (ARM64 + Intel)
- [ ] Apple notarisation
- [ ] Transcription profiles (named presets for model + language + prompt)
- [ ] Export transcript as SRT / VTT / TXT
- [ ] Batch clip export
- [ ] Windows and Linux support

---

## License

MIT — see [LICENSE](LICENSE)

---

## Acknowledgements

- [FFmpeg](https://ffmpeg.org/) — media processing
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) by Georgi Gerganov — on-device transcription
- [Tauri](https://tauri.app) — app framework
- [Lucide](https://lucide.dev) — icons
