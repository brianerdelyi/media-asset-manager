# v0.9.0 Preview — Smoke Test Checklist

**Build:** `Media Asset Manager_0.9.0_aarch64.dmg`
**Date:** 2026-05-22
**Platform:** macOS ARM64 (Apple Silicon)

---

## Installation

- [ ] Mount the `.dmg` file
- [ ] Drag **Media Asset Manager.app** to Applications folder
- [ ] Launch from Applications or Spotlight
- [ ] App icon appears correctly in Dock
- [ ] No macOS security warning blocks launch (if unsigned, right-click → Open)

---

## Appearance

- [ ] App opens at correct default size (1280×800)
- [ ] Dark mode matches system preference on launch
- [ ] Switch to Light mode in Settings → theme updates immediately
- [ ] Switch to Dark mode → theme updates immediately
- [ ] Switch to System → follows macOS preference
- [ ] Sidebar collapses to icon-only (56px)
- [ ] Sidebar expands to show labels (160px)
- [ ] Sidebar state persists after restart

---

## Drive Management

- [ ] Navigate to Drives view
- [ ] Click **Add Source** — Register dialog appears
- [ ] Browse and select a folder/drive
- [ ] Friendly name auto-populates
- [ ] Click **Register** — index prompt appears automatically
- [ ] Index prompt shows Video / Image / Audio checkboxes
- [ ] Uncheck a media type — Start Indexing button remains enabled
- [ ] Uncheck all types — Start Indexing button disabled
- [ ] Click **Cancel** on index prompt — drive registered but not indexed
- [ ] Drive row shows correct Online/Offline badge
- [ ] Drive row shows media type badges (Video, Image, Audio individually)
- [ ] Click **Index** on existing drive — prompt shows previously saved media types pre-selected
- [ ] Drive removal shows orphan count if applicable

---

## Indexing

- [ ] Start indexing — status bar appears at bottom of window
- [ ] Status bar aligns flush with sidebar (not overlapping or offset)
- [ ] Progress bar and file count update in real time
- [ ] Library view remains fully accessible during indexing
- [ ] Drives view remains accessible during indexing
- [ ] **Cancel** button stops indexing — cancellation toast appears
- [ ] Completed indexing — completion toast appears with asset count
- [ ] Status bar dismisses after 3 seconds on completion
- [ ] Expand/collapse sidebar during indexing — status bar tracks correctly

---

## Library

- [ ] Assets appear in grid after indexing
- [ ] Asset cards show **Asset Name** (not raw filename)
- [ ] Thumbnails load for video and image assets
- [ ] Duration badge visible on video cards
- [ ] Marker count badge visible on assets with markers
- [ ] Orphaned badge visible on orphaned assets
- [ ] Drive status dot correct (green online, grey offline)
- [ ] Search by filename returns correct results
- [ ] Clear search restores full library
- [ ] Filter by media type (Video / Image / Audio)
- [ ] Filter by status (Orphaned / Missing)
- [ ] Filter by drive
- [ ] Sort — Newest first, Oldest first, Filename, Size
- [ ] Pagination works when asset count exceeds 50

---

## Asset Detail — General

- [ ] Click an asset card — detail view opens
- [ ] **Back** button returns to library
- [ ] Asset Name field shows name (custom or filename without extension)
- [ ] Click Asset Name field — becomes editable
- [ ] Edit name, press Enter — saves and persists after closing and reopening
- [ ] Edit name, press Escape — reverts to previous value
- [ ] Filename shown in Metadata section
- [ ] Metadata rows populated (Type, Size, Duration, Resolution, Codec, Frame Rate)
- [ ] Location shows drive name with online/offline dot
- [ ] File path displayed in monospace

---

## Asset Detail — Video Playback

- [ ] Video player shows thumbnail poster before playback
- [ ] Click video or Play button — video plays
- [ ] Play/Pause button toggles correctly
- [ ] Timecode updates during playback
- [ ] Playhead triangle visible and moves during playback
- [ ] Playhead line visible below triangle
- [ ] Click on timeline — seeks to that position
- [ ] Drag playhead handle — scrubs video (ew-resize cursor on handle only)
- [ ] Track area cursor is default arrow (not grab/resize)
- [ ] Controls always visible — resize window wide and short to verify
- [ ] Open in default app button works (online assets only)
- [ ] Show in Finder button reveals file

---

## Markers

- [ ] **+ Add** button visible beside Markers heading in right panel
- [ ] Click **+ Add** — marker form appears with Name field, In/Out timecodes, Save/Cancel
- [ ] In timecode captures current playhead position
- [ ] Move playhead forward — Out timecode updates live
- [ ] Save button visible and inside the form card
- [ ] Click **Save** — marker saved, appears in list
- [ ] Click **Cancel** — form dismissed, no marker saved
- [ ] Click marker name in list — video seeks to In point
- [ ] Marker dot visible on timeline
- [ ] Range marker shows highlight band on timeline
- [ ] Marker action icons in correct order: Export → Rename → Delete
- [ ] **Rename** (pencil) — inline edit, Enter saves, Escape cancels
- [ ] **Delete** (X) — two-step confirmation (Yes/No)
- [ ] Markers persist after closing and reopening asset

---

## Clip Export

- [ ] Range marker shows **Export** (download) icon on hover
- [ ] Click Export — ClipExportConfirm dialog shows Name, Duration, Est. Size, Format
- [ ] Click **Choose Location** — native save dialog opens
- [ ] Default filename format: `AssetName-MarkerName.ext`
- [ ] Export completes — file exists on disk
- [ ] Exported file plays correctly in QuickTime

---

## Settings

- [ ] Statistics load correctly (total assets, video/image/audio counts, size)
- [ ] Purge thumbnails — confirmation prompt, then purge, then toast
- [ ] Delete orphaned assets — confirmation prompt, then delete, then toast
- [ ] Storage paths displayed correctly

---

## Edge Cases

- [ ] Disconnect drive while app is open — drive shows Offline, assets show correctly
- [ ] Reconnect drive — drive shows Online automatically
- [ ] Open asset on offline drive — Open/Show in Finder buttons hidden or disabled
- [ ] Resize window to minimum size — no content clipped
- [ ] Resize window wide and short — playbar always visible

---

## Notes

Record any issues found during testing:

| # | Area | Description | Severity |
|---|------|-------------|----------|
|   |      |             |          |
|   |      |             |          |
|   |      |             |          |
