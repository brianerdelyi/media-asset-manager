# User Stories — Media Asset Manager

> Version: 1.1
> Status: Revised
> Stage: 2 — Requirements & Scope
> Last Updated: 2026-05-19
> Change: Added Epic 8 (Video Playback) and Epic 9 (Markers) with US-24 through US-28. Updated version terminology to SemVer and backlog conventions.

---

## Epic 1 — Drive & Source Management

### US-01 — Register a media source
**As a** content creator,
**I want to** register an external drive or folder as a media source,
**So that** the app knows where my media assets are stored.

**Acceptance Criteria:**
- I can browse and select a drive or folder to register
- I can assign a friendly name to the source
- The source appears in my list of registered sources after registration
- The app captures a unique drive identifier (serial number or equivalent)

---

### US-02 — View registered sources
**As a** content creator,
**I want to** see all my registered media sources in one place,
**So that** I know which drives are being tracked.

**Acceptance Criteria:**
- All registered sources are listed with their friendly name
- Each source shows its online/offline status
- Each source shows the number of indexed assets

---

### US-03 — Remove a media source
**As a** content creator,
**I want to** remove a registered media source,
**So that** I can stop tracking drives I no longer use.

**Acceptance Criteria:**
- I can select a source and choose to remove it
- The app asks for confirmation before removing
- After removal, the source no longer appears in the list
- I am informed whether indexed assets will be retained or removed

---

### US-04 — Drive connection notification
**As a** content creator,
**I want to** be notified when a registered drive is connected,
**So that** I know the drive is available and can choose to re-index it.

**Acceptance Criteria:**
- The app detects when a registered drive is connected
- The drive status updates to online automatically
- If the drive has not been indexed before, I am prompted to index it

---

## Epic 2 — Indexing

### US-05 — Index a drive
**As a** content creator,
**I want to** index a registered drive,
**So that** all my media assets are catalogued and searchable.

**Acceptance Criteria:**
- I can trigger indexing from the source management screen
- Indexing runs in the background without blocking the UI
- A progress indicator shows files found, files indexed, and percentage complete
- I am notified when indexing completes

---

### US-06 — Cancel indexing
**As a** content creator,
**I want to** cancel an in-progress indexing operation,
**So that** I can stop it if needed without corrupting my library.

**Acceptance Criteria:**
- A cancel button is visible during indexing
- Clicking cancel stops the indexing process
- Assets indexed before cancellation are retained
- The library is not corrupted by cancellation

---

### US-07 — Incremental re-index
**As a** content creator,
**I want to** re-index a drive and have only new or changed files processed,
**So that** re-indexing is fast even on large drives.

**Acceptance Criteria:**
- Re-indexing skips files already indexed with no changes
- New files are added to the index
- Modified files are updated in the index
- Re-indexing completes faster than a full index on a drive with few changes

---

### US-08 — Missing file detection
**As a** content creator,
**I want to** know if a file I had indexed has been removed from a drive,
**So that** I can keep my library accurate.

**Acceptance Criteria:**
- When a registered drive is reconnected and re-indexed, missing files are flagged
- Missing assets remain in the index but are visually marked as missing
- I am notified of how many files were found to be missing

---

## Epic 3 — Thumbnail Generation

### US-09 — Enable thumbnail generation
**As a** content creator,
**I want to** enable thumbnail generation in settings,
**So that** I can visually browse my assets.

**Acceptance Criteria:**
- A setting exists to toggle thumbnail generation on or off
- When enabled, thumbnails are generated after indexing completes
- Thumbnails are stored in the app data directory
- Thumbnails are visible in the asset library view

---

### US-10 — Purge thumbnails
**As a** content creator,
**I want to** delete all stored thumbnails,
**So that** I can reclaim disk space.

**Acceptance Criteria:**
- A purge option exists in settings
- The app confirms before purging
- After purging, no thumbnail files remain in the app data directory
- The library continues to function without thumbnails

---

## Epic 4 — Tagging

### US-11 — Create and apply tags
**As a** content creator,
**I want to** create tags and apply them to assets,
**So that** I can organize my media by project, client, or type.

**Acceptance Criteria:**
- I can create a new tag by typing a name
- I can apply one or more tags to a selected asset
- Tags are case-insensitive
- Tags support spaces
- There is no limit on tags per asset

---

### US-12 — Remove a tag from an asset
**As a** content creator,
**I want to** remove a tag from an asset,
**So that** I can correct mistakes or reorganize my library.

**Acceptance Criteria:**
- I can remove any tag from an asset in the detail view
- The tag still exists in the tag list after removal from the asset
- The asset no longer appears in results filtered by that tag

---

### US-13 — Manage tags
**As a** content creator,
**I want to** view, rename, and delete tags from a central tag management screen,
**So that** I can keep my tag library organized.

**Acceptance Criteria:**
- A tag management screen lists all tags with asset counts
- I can rename a tag and all assets using it are updated
- I can delete a tag and it is removed from all assets
- Deletion requires confirmation

---

## Epic 5 — Search & Filtering

### US-14 — Search by filename
**As a** content creator,
**I want to** search for assets by filename,
**So that** I can quickly find a specific file.

**Acceptance Criteria:**
- A search field is visible in the main library view
- Typing in the search field filters results in real time or on submit
- Results match partial filenames
- Search works when the source drive is offline

---

### US-15 — Filter by tag
**As a** content creator,
**I want to** filter my library by one or more tags,
**So that** I can browse assets by project, client, or category.

**Acceptance Criteria:**
- I can select one or more tags from a tag picker
- The library updates to show only assets matching the selected tags
- Filtering works when the source drive is offline

---

### US-16 — Filter by media type
**As a** content creator,
**I want to** filter my library by media type (video, image, audio),
**So that** I can narrow my search to the type of asset I need.

**Acceptance Criteria:**
- I can filter by video, image, or audio independently
- Multiple types can be selected simultaneously
- Filtering works when the source drive is offline

---

### US-17 — Filter by date range
**As a** content creator,
**I want to** filter assets by creation or modification date,
**So that** I can find assets from a specific shoot or time period.

**Acceptance Criteria:**
- I can set a start and end date to filter results
- Results only include assets within the selected date range
- Filtering works when the source drive is offline

---

### US-18 — Offline search
**As a** content creator,
**I want to** search my entire library even when drives are disconnected,
**So that** I can locate assets and identify which drive they live on.

**Acceptance Criteria:**
- All search and filter functions work with no drives connected
- Search results clearly indicate which drive each asset belongs to
- Search results clearly indicate whether the source drive is online or offline

---

## Epic 6 — Asset Detail View

### US-19 — View asset details
**As a** content creator,
**I want to** open a detail view for any asset,
**So that** I can see its full metadata, tags, and markers.

**Acceptance Criteria:**
- Clicking an asset opens a detail view
- The detail view shows all extracted metadata
- The detail view shows all applied tags
- The detail view shows all markers associated with the asset
- The detail view shows the source drive name and status

---

### US-20 — Open asset with OS default app
**As a** content creator,
**I want to** open an asset directly from the app,
**So that** I can access it without manually navigating to it.

**Acceptance Criteria:**
- An "Open" button is available in the detail view when the drive is online
- Clicking Open launches the file in the OS default application
- The button is disabled or hidden when the drive is offline

---

### US-21 — Reveal asset in file manager
**As a** content creator,
**I want to** reveal an asset in my OS file manager,
**So that** I can access it directly in Finder, Explorer, or Nautilus.

**Acceptance Criteria:**
- A "Show in Finder / Explorer" button is available when the drive is online
- Clicking it opens the OS file manager with the file highlighted
- The button is disabled or hidden when the drive is offline

---

## Epic 7 — Settings & Library Management

### US-22 — Configure library location
**As a** content creator,
**I want to** choose where my library database is stored,
**So that** I can keep it on a fast drive or a preferred location.

**Acceptance Criteria:**
- A settings option allows me to change the library database path
- The default path follows OS conventions
- Changing the path takes effect after app restart
- The app warns me if the path is invalid or inaccessible

---

### US-23 — View library statistics
**As a** content creator,
**I want to** see statistics about my library,
**So that** I understand how much content I have indexed.

**Acceptance Criteria:**
- Statistics show total number of indexed assets
- Statistics show total number of registered sources
- Statistics show current database size on disk

---

## Epic 8 — Video Playback

### US-24 — Play a video asset in-app
**As a** content creator,
**I want to** play a video asset directly in the app,
**So that** I can preview footage without opening an external player.

**Acceptance Criteria:**
- A video player is visible in the asset detail view for supported video formats
- I can play and pause the video using player controls
- The player displays the current time and total duration
- The player is only available when the source drive is online
- For unsupported formats, an "Open in external player" button is shown instead

---

### US-25 — Scrub through a video timeline
**As a** content creator,
**I want to** scrub through a video timeline,
**So that** I can quickly navigate to specific moments in the footage.

**Acceptance Criteria:**
- A timeline scrubber is visible below the video player
- Dragging the scrubber seeks the video to the corresponding position
- The current time display updates as I scrub
- Markers are visible on the timeline at their time positions

---

## Epic 9 — Markers

### US-26 — Create a single-point marker
**As a** content creator,
**I want to** place a named marker at a specific point in a video,
**So that** I can bookmark key moments for later reference.

**Acceptance Criteria:**
- I can create a marker at the current playback position
- I can give the marker a name
- The marker appears as a visual indicator on the video timeline
- The marker appears in the marker list in the detail view
- The marker is saved to the database and persists across sessions

---

### US-27 — Create an in/out marker (clip)
**As a** content creator,
**I want to** mark an in point and an out point on a video,
**So that** I can designate a usable clip range within the footage.

**Acceptance Criteria:**
- I can set an in point and an out point at any positions on the timeline
- I can give the in/out marker pair a name
- The clip range is visually indicated on the timeline
- The in/out marker appears in the marker list with its name and time range
- The marker is saved to the database and persists across sessions

---

### US-28 — Manage markers on an asset
**As a** content creator,
**I want to** view, edit, and delete markers on a video asset,
**So that** I can keep my markers organized and accurate.

**Acceptance Criteria:**
- All markers for an asset are listed in the detail view
- Each marker shows its name, type (single point or in/out), and time position(s)
- I can click a marker in the list to seek the player to that position (when drive is online)
- I can rename any marker
- I can delete any marker; deletion requires confirmation
- Markers are visible and manageable even when the drive is offline

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Added Epic 8 (Video Playback: US-24, US-25) and Epic 9 (Markers: US-26, US-27, US-28). Updated US-19 to include markers in detail view. Updated version terminology to SemVer and backlog conventions. |
