# Functional Requirements — Media Asset Manager

> Version: 1.1
> Status: Revised
> Stage: 2 — Requirements & Scope
> Last Updated: 2026-05-19
> Change: Added Section 9 (Video Playback) and Section 10 (Markers). Updated terminology to SemVer and backlog conventions.

---

## 1. Drive & Source Management

| ID | Requirement | Version |
|---|---|---|
| FR-01 | The user shall be able to register a drive or folder as a media source | 1.0.0 |
| FR-02 | The user shall be able to view all registered media sources | 1.0.0 |
| FR-03 | The user shall be able to remove a registered media source | 1.0.0 |
| FR-04 | The app shall display the online/offline status of each registered source | 1.0.0 |
| FR-05 | When a registered drive is connected, the app shall detect it and notify the user | 1.0.0 |
| FR-06 | When a registered drive is connected for the first time after registration, the app shall prompt the user to index it | 1.0.0 |
| FR-07 | The user shall be able to assign a friendly name to each registered source | 1.0.0 |
| FR-08 | The app shall store the drive serial number or unique identifier to distinguish drives with the same label | 1.0.0 |

---

## 2. Indexing

| ID | Requirement | Version |
|---|---|---|
| FR-09 | The user shall be able to manually trigger indexing of a registered source | 1.0.0 |
| FR-10 | Indexing shall run as a background process and shall not block the UI | 1.0.0 |
| FR-11 | The app shall display indexing progress (files found, files indexed, percentage complete) | 1.0.0 |
| FR-12 | The user shall be able to cancel an in-progress indexing operation | 1.0.0 |
| FR-13 | The app shall support incremental re-indexing (only scan new or modified files) | 1.0.0 |
| FR-14 | The app shall index video files including but not limited to: MP4, MOV, MXF, AVI, MKV | 1.0.0 |
| FR-15 | The app shall index image files including but not limited to: JPG, JPEG, PNG, TIFF, WEBP, HEIC | 1.0.0 |
| FR-16 | The app shall index audio files including but not limited to: WAV, MP3, AIFF, AAC, FLAC | 1.0.0 |
| FR-17 | The app shall extract and store the following metadata for each asset: filename, file path, file size, file type, creation date, modification date | 1.0.0 |
| FR-18 | The app shall extract and store media-specific metadata: duration (video/audio), resolution/dimensions (video/image), codec (video/audio), frame rate (video), sample rate (audio) | 1.0.0 |
| FR-19 | If a previously indexed file no longer exists on a reconnected drive, the app shall flag it as missing | 1.0.0 |
| FR-20 | The app shall not delete index records for assets on offline drives | 1.0.0 |

---

## 3. Thumbnail & Preview Generation

| ID | Requirement | Version |
|---|---|---|
| FR-21 | The app shall provide a setting to enable or disable thumbnail generation | 1.0.0 |
| FR-22 | When enabled, the app shall generate a thumbnail for video assets by extracting a frame | 1.0.0 |
| FR-23 | When enabled, the app shall generate a thumbnail for image assets | 1.0.0 |
| FR-24 | Audio assets shall display a generic audio placeholder icon (no thumbnail) | 1.0.0 |
| FR-25 | Thumbnails shall be stored in the app data directory, not alongside the source files | 1.0.0 |
| FR-26 | The user shall be able to purge all stored thumbnails from settings | 1.0.0 |
| FR-27 | Thumbnail generation shall occur after metadata indexing completes, not during | 1.0.0 |
| FR-28 | The app shall display a placeholder when a thumbnail has not been generated or is unavailable | 1.0.0 |

---

## 4. Tagging

| ID | Requirement | Version |
|---|---|---|
| FR-29 | The user shall be able to create tags | 1.0.0 |
| FR-30 | The user shall be able to apply one or more tags to any indexed asset | 1.0.0 |
| FR-31 | The user shall be able to remove a tag from an asset | 1.0.0 |
| FR-32 | Tags shall be case-insensitive (e.g. "BRoll" and "broll" are the same tag) | 1.0.0 |
| FR-33 | Tags shall support spaces (e.g. "summer campaign" is a valid tag) | 1.0.0 |
| FR-34 | There shall be no limit on the number of tags applied to a single asset | 1.0.0 |
| FR-35 | The user shall be able to view all tags in a tag management screen | 1.0.0 |
| FR-36 | The user shall be able to rename a tag; renaming shall update all assets using that tag | 1.0.0 |
| FR-37 | The user shall be able to delete a tag; deletion shall remove it from all assets | 1.0.0 |
| FR-38 | The tag management screen shall display how many assets use each tag | 1.0.0 |
| FR-39 | The user shall be able to apply tags to multiple selected assets simultaneously | Backlog |

---

## 5. Search & Filtering

| ID | Requirement | Version |
|---|---|---|
| FR-40 | The user shall be able to search the asset index by filename | 1.0.0 |
| FR-41 | The user shall be able to filter assets by media type (video, image, audio) | 1.0.0 |
| FR-42 | The user shall be able to filter assets by one or more tags | 1.0.0 |
| FR-43 | The user shall be able to filter assets by date range (creation or modification date) | 1.0.0 |
| FR-44 | The user shall be able to filter assets by source drive | 1.0.0 |
| FR-45 | Search and filters shall work when the source drive is offline | 1.0.0 |
| FR-46 | The user shall be able to combine search terms and filters simultaneously | 1.0.0 |
| FR-47 | Search results shall display asset thumbnail (if available), filename, type, source drive, and online/offline status | 1.0.0 |
| FR-48 | The user shall be able to sort search results by filename, date, file size, and media type | 1.0.0 |
| FR-49 | The user shall be able to filter assets that have one or more markers | 1.0.0 |

---

## 6. Asset Detail View

| ID | Requirement | Version |
|---|---|---|
| FR-50 | The user shall be able to open a detail view for any indexed asset | 1.0.0 |
| FR-51 | The detail view shall display all extracted metadata for the asset | 1.0.0 |
| FR-52 | The detail view shall display the asset thumbnail if available | 1.0.0 |
| FR-53 | The detail view shall display all tags applied to the asset | 1.0.0 |
| FR-54 | The user shall be able to add and remove tags from the detail view | 1.0.0 |
| FR-55 | The detail view shall display the source drive name and online/offline status | 1.0.0 |
| FR-56 | When the source drive is online, the user shall be able to open the asset with the OS default application | 1.0.0 |
| FR-57 | When the source drive is online, the user shall be able to reveal the asset in the OS file manager | 1.0.0 |
| FR-58 | The detail view shall display all markers associated with the asset | 1.0.0 |

---

## 7. Library & Settings

| ID | Requirement | Version |
|---|---|---|
| FR-59 | The app shall maintain one library database for version 1.0.0 | 1.0.0 |
| FR-60 | The default library location shall follow OS conventions (app data directory) | 1.0.0 |
| FR-61 | The user shall be able to specify a custom library database location | 1.0.0 |
| FR-62 | The user shall be able to view library statistics (total assets, total drives, database size) | 1.0.0 |
| FR-63 | The user shall be able to toggle thumbnail generation on or off in settings | 1.0.0 |
| FR-64 | The user shall be able to purge all thumbnails from settings | 1.0.0 |

---

## 8. Video Playback

| ID | Requirement | Version |
|---|---|---|
| FR-65 | The app shall provide an in-app video player in the asset detail view | 1.0.0 |
| FR-66 | The video player shall support play and pause controls | 1.0.0 |
| FR-67 | The video player shall provide a timeline scrubber allowing the user to seek to any point in the video | 1.0.0 |
| FR-68 | The video player shall display the current playback position and total duration | 1.0.0 |
| FR-69 | The video player shall support natively supported formats: H.264/MP4 (primary), H.265/MP4 (where supported by OS webview) | 1.0.0 |
| FR-70 | For video assets in unsupported formats, the app shall display an "Open in external player" button instead of the in-app player | 1.0.0 |
| FR-71 | The video player shall only be available when the source drive is online | 1.0.0 |
| FR-72 | The video player shall display markers on the timeline at their respective time positions | 1.0.0 |
| FR-73 | Advanced playback controls (speed, frame stepping, volume) shall not be included in version 1.0.0 | Backlog |

---

## 9. Markers

| ID | Requirement | Version |
|---|---|---|
| FR-74 | The user shall be able to create a named single-point marker at any position on a video timeline | 1.0.0 |
| FR-75 | The user shall be able to create a named in/out marker that designates a clip range on a video timeline | 1.0.0 |
| FR-76 | A video asset shall support multiple markers of any type | 1.0.0 |
| FR-77 | Each marker shall have a user-defined name | 1.0.0 |
| FR-78 | The user shall be able to edit the name of an existing marker | 1.0.0 |
| FR-79 | The user shall be able to delete a marker | 1.0.0 |
| FR-80 | Markers shall be stored in the local database only and shall never be written to the media file | 1.0.0 |
| FR-81 | Markers shall be visible and manageable when the source drive is offline | 1.0.0 |
| FR-82 | The asset detail view shall display a list of all markers with their name, type, and time position(s) | 1.0.0 |
| FR-83 | Clicking a marker in the list shall seek the video player to that marker's position (when drive is online) | 1.0.0 |
| FR-84 | Markers shall be displayed as visual indicators on the video player timeline | 1.0.0 |
| FR-85 | Lossless clip export from in/out markers shall not be included in version 1.0.0 | Backlog |

---

## 10. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Added Section 8 (Video Playback, FR-65–FR-73) and Section 9 (Markers, FR-74–FR-85). Added FR-49 (filter by markers). Added FR-58 (markers in detail view). Renumbered affected requirements. Updated version column from MVP/Future to SemVer and Backlog conventions. |
