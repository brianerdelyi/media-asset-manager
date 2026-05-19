# Functional Requirements — Media Asset Manager

> Version: 1.4
> Status: Revised
> Stage: 2 — Requirements & Scope
> Last Updated: 2026-05-19
> Change: Updated FR-23 and FR-29 to reflect Option B thumbnail setting — global default plus per-index confirmation dialog override.

---

## Terminology

| Term | Definition |
|---|---|
| **Orphaned asset** | An indexed asset that has no remaining location on any registered drive |
| **Offline asset** | An asset whose drive is registered but currently disconnected |
| **Missing file** | A file that was indexed but is no longer found at its path on a reconnected drive |

---

## 1. Drive & Source Management

| ID | Requirement | Version |
|---|---|---|
| FR-01 | The user shall be able to register a drive or folder as a media source using a browse dialog | 1.0.0 |
| FR-02 | The user shall be able to view all registered media sources | 1.0.0 |
| FR-03 | The user shall be able to remove a registered media source | 1.0.0 |
| FR-04 | The app shall display the online/offline status of each registered source | 1.0.0 |
| FR-05 | The app shall detect drive connections and disconnections in real time using OS file system events and update drive status automatically | 1.0.0 |
| FR-06 | When a registered drive is connected for the first time after registration, the app shall prompt the user to index it | 1.0.0 |
| FR-07 | The user shall be able to assign a friendly name to each registered source | 1.0.0 |
| FR-08 | The app shall identify drives using a platform-appropriate unique identifier: Volume UUID (macOS), Volume Serial Number (Windows), UUID from /dev/disk/by-uuid/ (Linux). Network shares shall be fingerprinted using hostname and share path. All identifiers shall be normalized to a UUID string in the database. | 1.0.0 |
| FR-09 | When a user removes a registered drive, if any assets would become orphaned, the app shall inform the user of the count and prompt them to keep or delete the affected assets | 1.0.0 |
| FR-10 | Drive registration via drag-and-drop shall not be included in version 1.0.0 | Backlog |

---

## 2. Indexing

| ID | Requirement | Version |
|---|---|---|
| FR-11 | The user shall be able to manually trigger indexing of a registered source | 1.0.0 |
| FR-12 | Indexing shall run as a background process and shall not block the UI | 1.0.0 |
| FR-13 | The app shall display indexing progress (files found, files indexed, percentage complete) | 1.0.0 |
| FR-14 | The user shall be able to cancel an in-progress indexing operation | 1.0.0 |
| FR-15 | The app shall support incremental re-indexing (only scan new or modified files) | 1.0.0 |
| FR-16 | The app shall index video files including but not limited to: MP4, MOV, MXF, AVI, MKV | 1.0.0 |
| FR-17 | The app shall index image files including but not limited to: JPG, JPEG, PNG, TIFF, WEBP, HEIC | 1.0.0 |
| FR-18 | The app shall index audio files including but not limited to: WAV, MP3, AIFF, AAC, FLAC | 1.0.0 |
| FR-19 | The app shall extract and store the following metadata for each asset: filename, file path, file size, file type, creation date, modification date | 1.0.0 |
| FR-20 | The app shall extract and store media-specific metadata: duration (video/audio), resolution/dimensions (video/image), codec (video/audio), frame rate (video), sample rate (audio) | 1.0.0 |
| FR-21 | If a previously indexed file no longer exists on a reconnected drive, the app shall flag it as a missing file | 1.0.0 |
| FR-22 | The app shall not delete index records for assets on offline drives | 1.0.0 |

---

## 3. Thumbnail & Preview Generation

| ID | Requirement | Version |
|---|---|---|
| FR-23 | The app shall maintain a global default setting for thumbnail generation (on or off); this default shall be configurable in Settings | 1.0.0 |
| FR-24 | When enabled, the app shall generate a thumbnail for video assets by extracting a frame at 10% of the total duration | 1.0.0 |
| FR-25 | When enabled, the app shall generate a thumbnail for image assets | 1.0.0 |
| FR-26 | Audio assets shall display a generic audio placeholder icon (no thumbnail) | 1.0.0 |
| FR-27 | Thumbnails shall be stored in the app data directory, not alongside the source files | 1.0.0 |
| FR-28 | The user shall be able to purge all stored thumbnails from settings | 1.0.0 |
| FR-29 | When indexing is triggered, the app shall display a confirmation dialog showing the drive name and a thumbnail generation checkbox pre-filled with the global default; the user may override the default for that indexing run only | 1.0.0 |
| FR-30 | Thumbnail generation shall occur after metadata indexing completes, not during | 1.0.0 |
| FR-31 | The app shall display a placeholder when a thumbnail has not been generated or is unavailable | 1.0.0 |

---

## 4. Tagging

| ID | Requirement | Version |
|---|---|---|
| FR-32 | The user shall be able to create tags | 1.0.0 |
| FR-33 | The user shall be able to apply one or more tags to any indexed asset | 1.0.0 |
| FR-34 | The user shall be able to remove a tag from an asset | 1.0.0 |
| FR-35 | Tags shall be case-insensitive (e.g. "BRoll" and "broll" are the same tag) | 1.0.0 |
| FR-36 | Tags shall support spaces (e.g. "summer campaign" is a valid tag) | 1.0.0 |
| FR-37 | There shall be no limit on the number of tags applied to a single asset | 1.0.0 |
| FR-38 | The user shall be able to view all tags in a tag management screen | 1.0.0 |
| FR-39 | The user shall be able to rename a tag; renaming shall update all assets using that tag | 1.0.0 |
| FR-40 | The user shall be able to delete a tag; deletion shall remove it from all assets | 1.0.0 |
| FR-41 | The tag management screen shall display how many assets use each tag | 1.0.0 |
| FR-42 | The user shall be able to apply tags to multiple selected assets simultaneously | Backlog |

---

## 5. Search & Filtering

| ID | Requirement | Version |
|---|---|---|
| FR-43 | The user shall be able to search the asset index by filename | 1.0.0 |
| FR-44 | Search shall be triggered by pressing Enter or clicking a Search button; live keystroke search shall not be included in version 1.0.0 | 1.0.0 |
| FR-45 | The user shall be able to filter assets by media type (video, image, audio) | 1.0.0 |
| FR-46 | The user shall be able to filter assets by one or more tags | 1.0.0 |
| FR-47 | The user shall be able to filter assets by date range (creation or modification date) | 1.0.0 |
| FR-48 | The user shall be able to filter assets by source drive | 1.0.0 |
| FR-49 | Search and filters shall work when the source drive is offline | 1.0.0 |
| FR-50 | The user shall be able to combine search terms and filters simultaneously | 1.0.0 |
| FR-51 | Search results shall display asset thumbnail (if available), filename, type, source drive, and online/offline status | 1.0.0 |
| FR-52 | The user shall be able to sort search results by filename, date, file size, and media type | 1.0.0 |
| FR-53 | The user shall be able to filter assets that have one or more markers | 1.0.0 |
| FR-54 | The user shall be able to filter assets by status: all, orphaned, missing | 1.0.0 |

---

## 6. Asset Detail View

| ID | Requirement | Version |
|---|---|---|
| FR-55 | The user shall be able to open a detail view for any indexed asset | 1.0.0 |
| FR-56 | The detail view shall display all extracted metadata for the asset | 1.0.0 |
| FR-57 | The detail view shall display the asset thumbnail if available | 1.0.0 |
| FR-58 | The detail view shall display all tags applied to the asset | 1.0.0 |
| FR-59 | The user shall be able to add and remove tags from the detail view | 1.0.0 |
| FR-60 | The detail view shall display all known locations for the asset, each with its drive name and online/offline status | 1.0.0 |
| FR-61 | When at least one source drive is online, the user shall be able to open the asset with the OS default application | 1.0.0 |
| FR-62 | When at least one source drive is online, the user shall be able to reveal the asset in the OS file manager | 1.0.0 |
| FR-63 | The detail view shall display all markers associated with the asset | 1.0.0 |
| FR-64 | The detail view shall clearly indicate if an asset is orphaned | 1.0.0 |

---

## 7. Library & Settings

| ID | Requirement | Version |
|---|---|---|
| FR-65 | The app shall maintain one library database for version 1.0.0 | 1.0.0 |
| FR-66 | The default library location shall follow OS conventions (app data directory) | 1.0.0 |
| FR-67 | The user shall be able to specify a custom library database location | 1.0.0 |
| FR-68 | The user shall be able to view library statistics (total assets, total drives, total locations, orphaned asset count, database size) | 1.0.0 |
| FR-69 | The user shall be able to set the global thumbnail generation default on or off in settings | 1.0.0 |
| FR-70 | The user shall be able to purge all thumbnails from settings | 1.0.0 |
| FR-71 | The user shall be able to view and bulk delete all orphaned assets from settings | 1.0.0 |

---

## 8. Video Playback

| ID | Requirement | Version |
|---|---|---|
| FR-72 | The app shall provide an in-app video player in the asset detail view | 1.0.0 |
| FR-73 | The video player shall support play and pause controls | 1.0.0 |
| FR-74 | The video player shall provide a timeline scrubber allowing the user to seek to any point in the video | 1.0.0 |
| FR-75 | The video player shall display the current playback position and total duration | 1.0.0 |
| FR-76 | The video player shall support natively supported formats: H.264/MP4 (primary), H.265/MP4 (where supported by OS webview) | 1.0.0 |
| FR-77 | For video assets in unsupported formats, the app shall display an "Open in external player" button instead of the in-app player | 1.0.0 |
| FR-78 | The video player shall only be available when at least one source drive is online | 1.0.0 |
| FR-79 | The video player shall display markers on the timeline at their respective time positions | 1.0.0 |
| FR-80 | Advanced playback controls (speed, frame stepping, volume) shall not be included in version 1.0.0 | Backlog |

---

## 9. Markers

| ID | Requirement | Version |
|---|---|---|
| FR-81 | The user shall be able to create a named single-point marker at any position on a video timeline | 1.0.0 |
| FR-82 | The user shall be able to create a named in/out marker that designates a clip range on a video timeline | 1.0.0 |
| FR-83 | A video asset shall support multiple markers of any type | 1.0.0 |
| FR-84 | Each marker shall have a user-defined name | 1.0.0 |
| FR-85 | The user shall be able to edit the name of an existing marker | 1.0.0 |
| FR-86 | The user shall be able to delete a marker | 1.0.0 |
| FR-87 | Markers shall be stored in the local database only and shall never be written to the media file | 1.0.0 |
| FR-88 | Markers shall be visible and manageable when the source drive is offline | 1.0.0 |
| FR-89 | The asset detail view shall display a list of all markers with their name, type, and time position(s) | 1.0.0 |
| FR-90 | Clicking a marker in the list shall seek the video player to that marker's position (when drive is online) | 1.0.0 |
| FR-91 | Markers shall be displayed as visual indicators on the video player timeline | 1.0.0 |
| FR-92 | Lossless clip export from in/out markers shall not be included in version 1.0.0 | Backlog |

---

## 10. Duplicate Detection

| ID | Requirement | Version |
|---|---|---|
| FR-93 | The app shall compute a content fingerprint for every indexed file to detect duplicates | 1.0.0 |
| FR-94 | The fingerprint shall be computed as follows: for files larger than 128KB, SHA256 of the first 64KB concatenated with the last 64KB of the file; for files 128KB or smaller, SHA256 of the entire file | 1.0.0 |
| FR-95 | The fingerprint shall be computed at index time and stored in the database | 1.0.0 |
| FR-96 | During indexing, if a file's fingerprint matches an existing asset in the database, the app shall not create a new asset record; instead it shall add a new location record to the existing asset | 1.0.0 |
| FR-97 | Duplicate detection shall work across all registered drives and folders | 1.0.0 |
| FR-98 | The app shall use file size as a pre-filter before computing a fingerprint; fingerprints shall only be computed for files that share a size with an existing indexed asset | 1.0.0 |

---

## 11. Asset Locations

| ID | Requirement | Version |
|---|---|---|
| FR-99 | Each asset shall support one or more location records representing all known file paths where that asset exists | 1.0.0 |
| FR-100 | Each location record shall store: drive identifier, file path, filename, and last seen date | 1.0.0 |
| FR-101 | The asset detail view shall list all locations for the asset, each showing drive name and online/offline status | 1.0.0 |
| FR-102 | When a registered drive is removed, all location records associated with that drive shall be deleted | 1.0.0 |
| FR-103 | When a location record is deleted and the asset has no remaining locations, the asset shall be marked as orphaned | 1.0.0 |
| FR-104 | When a file is not found at its path during re-indexing of a connected drive, its location record shall be flagged as a missing file | 1.0.0 |

---

## 12. Orphaned Assets

| ID | Requirement | Version |
|---|---|---|
| FR-105 | An orphaned asset shall remain in the library with all its metadata, tags, and markers intact | 1.0.0 |
| FR-106 | Orphaned assets shall be clearly indicated in the library view and detail view | 1.0.0 |
| FR-107 | Orphaned assets shall be searchable and filterable in the library | 1.0.0 |
| FR-108 | No playback or file access shall be available for orphaned assets | 1.0.0 |
| FR-109 | The user shall be able to manually delete an orphaned asset from the library; deletion shall remove the asset record, all location records, all tags, and all markers | 1.0.0 |
| FR-110 | When a drive is removed and assets would become orphaned, the app shall display the count of affected assets and prompt the user to keep them as orphaned or delete them | 1.0.0 |
| FR-111 | The user shall be able to bulk delete all orphaned assets from the settings screen | 1.0.0 |

---

## 13. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Added video playback and marker requirements. Updated version terminology. |
| 1.2 | 2026-05-19 | Resolved OQ-06 through OQ-10. Renumbered requirements for consistency. |
| 1.3 | 2026-05-19 | Added duplicate detection (FR-93–FR-98), asset locations (FR-99–FR-104), orphaned assets (FR-105–FR-111). Added FR-09 (drive removal prompt), FR-54 (filter by status), FR-64 (orphaned indicator in detail view), FR-71 (bulk delete orphaned). Updated FR-60 and FR-61 for multi-location awareness. Added terminology definitions. |
| 1.4 | 2026-05-19 | Updated FR-23 (global thumbnail default setting) and FR-29 (per-index confirmation dialog with override). Added FR-69 (global default in settings). Renumbered affected requirements throughout. |
