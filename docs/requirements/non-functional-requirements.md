# Non-Functional Requirements — Media Asset Manager

> Version: 1.1
> Status: Revised
> Stage: 2 — Requirements & Scope
> Last Updated: 2026-05-19
> Change: Added NFR-38 and NFR-39 for video playback compatibility. Updated version terminology to SemVer.

---

## 1. Performance

| ID | Requirement |
|---|---|
| NFR-01 | The application shall start and be interactive within 3 seconds on average hardware |
| NFR-02 | Search results shall be returned within 1 second for libraries of up to 100,000 assets |
| NFR-03 | Indexing shall process a minimum of 200 files per minute on average hardware |
| NFR-04 | Thumbnail generation shall not block or degrade UI responsiveness |
| NFR-05 | Incremental re-indexing shall complete significantly faster than full indexing for drives with few changes |
| NFR-06 | The UI shall remain responsive during all background operations |
| NFR-07 | Video playback shall begin within 2 seconds of the user initiating play for natively supported formats |

---

## 2. Scalability

| ID | Requirement |
|---|---|
| NFR-08 | The app shall support libraries containing up to 500,000 indexed assets without degradation |
| NFR-09 | The app shall support up to 50 registered media sources |
| NFR-10 | SQLite indexes shall be applied to all frequently queried columns |
| NFR-11 | The app shall handle drives up to 8TB in size |

---

## 3. Reliability

| ID | Requirement |
|---|---|
| NFR-12 | The app shall not lose index data on unexpected shutdown |
| NFR-13 | SQLite shall be configured in WAL (Write-Ahead Logging) mode to prevent corruption |
| NFR-14 | A cancelled or interrupted indexing operation shall not corrupt the existing index |
| NFR-15 | The app shall handle missing or inaccessible files gracefully without crashing |
| NFR-16 | The app shall log errors to a local log file for debugging purposes |

---

## 4. Usability

| ID | Requirement |
|---|---|
| NFR-17 | The app shall follow platform UI conventions on each OS (macOS, Windows, Linux) |
| NFR-18 | All destructive actions (delete tag, remove source, delete marker) shall require user confirmation |
| NFR-19 | The app shall provide clear feedback for all long-running operations |
| NFR-20 | Error messages shall be human-readable and actionable |
| NFR-21 | The app shall be usable without documentation for core workflows |

---

## 5. Compatibility

| ID | Requirement |
|---|---|
| NFR-22 | The app shall run on Windows 10 and later |
| NFR-23 | The app shall run on macOS 12 (Monterey) and later |
| NFR-24 | The app shall run on Ubuntu 22.04 and later |
| NFR-25 | The app shall support both x86_64 and ARM64 architectures on macOS (Apple Silicon) |
| NFR-26 | The app shall handle platform-specific file path formats correctly (backslash vs forward slash) |
| NFR-38 | The app shall document known video format and codec playback limitations per platform |
| NFR-39 | The app shall gracefully handle unsupported video formats by offering an external player fallback rather than showing an error |

---

## 6. Security & Privacy

| ID | Requirement |
|---|---|
| NFR-27 | The app shall not transmit any user data or metadata over the internet |
| NFR-28 | The app shall not require an internet connection for any core functionality |
| NFR-29 | The app shall only access file system paths that the user has explicitly registered |
| NFR-30 | The SQLite database shall be stored in the user's own file system with no external access |
| NFR-31 | The app shall not embed any telemetry, analytics, or tracking |

---

## 7. Maintainability

| ID | Requirement |
|---|---|
| NFR-32 | The codebase shall follow consistent naming conventions as defined in coding standards |
| NFR-33 | All Tauri commands shall be documented with their purpose and parameters |
| NFR-34 | The SQLite schema shall be versioned and support migrations |
| NFR-35 | The app shall log sufficient information to diagnose common issues without exposing sensitive data |

---

## 8. Installability

| ID | Requirement |
|---|---|
| NFR-36 | The app shall be distributed as a native installer for each platform (.dmg for macOS, .msi or .exe for Windows, .deb/.AppImage for Linux) |
| NFR-37 | Installation shall not require administrator/root privileges where possible |
| NFR-40 | The app shall be uninstallable cleanly via standard OS mechanisms |

---

## 9. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Added NFR-07 (playback startup time), NFR-38 (document playback limitations), NFR-39 (graceful unsupported format handling). Updated NFR-18 to include marker deletion. Updated version terminology. |
