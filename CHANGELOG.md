# Changelog

All notable changes to Media Asset Manager are documented here.

---

## [0.9.0] — Preview — 2026-05-22

### Sprint 8 — UI Polish & Design System

#### Design System
- CSS custom properties for all colours — full light and dark mode support
- Theme follows macOS system preference; user can override to Light, Dark, or System in Settings
- macOS system blue (`#0A84FF`) accent throughout
- SF Pro system font
- Lucide icon set replacing all emoji icons
- Collapsible sidebar — icon only (56px) or icon + label (160px), state persists

#### Asset Detail View
- Editable Asset Name field — persists across sessions, used in clip export filenames
- Filename moved to Metadata section
- Thumbnail removed from right panel (visible as video poster instead)
- Add Marker button moved to Markers section header in right panel
- Marker icons reordered: Export → Rename → Delete
- Video player controls always visible — height computed from available space
- Playhead triangle and line visible in both light and dark mode

#### Library View
- Asset cards display Asset Name (custom name if set, otherwise filename without extension)
- Asset card size increased to 192px

#### Drives View
- Full width layout
- Individual media type badges per drive (Video / Image / Audio)
- Post-registration index prompt with media type selection
- Index dialog shows media type checkboxes — Video, Image, Audio independently selectable
- Media type preference saved per drive, pre-populated on subsequent index

#### Indexing
- Status bar replaces modal overlay — content remains accessible during indexing
- Status bar aligns with sidebar width (collapsed/expanded)
- Toast notifications on completion and cancellation

#### Settings
- Theme toggle: System / Light / Dark
- Responsive layout — action buttons stack on narrow windows

#### App Icon
- Three stacked coloured rectangles (green, purple, blue) on dark background

---

## [0.1.0] — 2026-05-01

### Sprints 1–7 — Core Functionality

- Drive registration and online/offline detection
- Background indexing with FFmpeg metadata extraction
- WebP thumbnail generation
- SQLite library with WAL mode, three-connection architecture
- Asset search with filters (type, drive, status, markers)
- Asset detail view with video playback
- Timeline scrubber with marker overlay
- Point and range markers (In/Out)
- Lossless clip export via FFmpeg stream copy
- Settings screen with library statistics, orphan cleanup, thumbnail purge
