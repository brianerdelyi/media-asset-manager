# Definition of Done — Media Asset Manager

> Version: 1.1
> Status: Revised
> Stage: 4 — Implementation Planning
> Last Updated: 2026-05-19
> Change: Updated to macOS-first release strategy. Version 1.0.0 release criteria updated to macOS only. Windows and Linux moved to backlog. Feature-level DoD updated to require macOS validation only for 1.0.0.

---

## 1. Purpose

The Definition of Done (DoD) is the shared standard that must be met before any feature, fix, or task is considered complete. Nothing moves to the next sprint or is merged to `main` until all applicable criteria are satisfied.

---

## 2. Definition of Done — Feature Level

A feature is done when ALL of the following are true:

### Functionality
- [ ] All acceptance criteria from the corresponding user story are met
- [ ] The feature works correctly on macOS (Apple Silicon and Intel)
- [ ] The feature works correctly when relevant drives are offline (where applicable)
- [ ] All error states are handled gracefully — no unhandled exceptions or silent failures
- [ ] Destructive actions (delete, remove, purge) require user confirmation
- [ ] Platform-specific code is isolated behind `#[cfg(target_os)]` — no platform logic in shared modules

### Code Quality
- [ ] Code follows naming conventions defined in coding-standards.md
- [ ] No `any` types in TypeScript (frontend)
- [ ] No `unwrap()` or `panic!()` in Tauri command handlers (backend)
- [ ] No commented-out code committed
- [ ] No unused imports or variables
- [ ] ESLint and Prettier pass with no errors (frontend)
- [ ] `cargo fmt` and `cargo clippy` pass with no warnings (backend)

### Testing
- [ ] Unit tests written for all new business logic
- [ ] All new Tauri commands have at least one integration test
- [ ] Error paths tested — not just happy paths
- [ ] All existing tests pass — no regressions introduced

### Documentation
- [ ] All public Rust functions have `///` doc comments
- [ ] All new Tauri commands have a doc comment
- [ ] Complex logic has inline comments explaining the approach
- [ ] CHANGELOG.md updated with a meaningful entry
- [ ] If the feature changes a requirement or architecture decision, the relevant document is updated

### Traceability
- [ ] Commit message references relevant FR and US IDs where applicable
- [ ] Feature can be traced from user story → functional requirement → implementation → test

---

## 3. Definition of Done — Sprint Level

A sprint is done when ALL of the following are true:

- [ ] All feature-level DoD criteria met for every task in the sprint
- [ ] Feature branch merged to `dev` with `--no-ff`
- [ ] `dev` branch builds and runs cleanly on macOS
- [ ] Sprint version tag applied (e.g. `v0.2.0`)
- [ ] TODO.md updated to reflect completed and upcoming work
- [ ] Open questions or risks identified and documented

---

## 4. Definition of Done — Version 1.0.0 Release (macOS)

Version 1.0.0 is done when ALL of the following are true:

### All Features
- [ ] All 32 user stories (US-01 through US-32) meet feature-level DoD
- [ ] All functional requirements FR-01 through FR-111 implemented and verified on macOS

### macOS Platform
- [ ] App installs and runs on macOS 12 (Monterey) and later
- [ ] App runs correctly on Apple Silicon (ARM64)
- [ ] App runs correctly on Intel (x86_64)
- [ ] macOS Volume UUID drive identification works correctly
- [ ] Real-time drive detection via FSEvents works correctly
- [ ] WebKit video playback verified for H.264/MP4
- [ ] WebP thumbnails render correctly in WebKit
- [ ] FFmpeg sidecar executes correctly for both macOS architectures
- [ ] Finder integration works (reveal in Finder, open with default app)

### Performance
- [ ] App starts in under 3 seconds on average macOS hardware
- [ ] Search returns results in under 1 second for 100,000 asset library
- [ ] Indexing processes minimum 200 files per minute on average macOS hardware
- [ ] UI remains responsive during all background operations

### Installer
- [ ] macOS .dmg installer builds cleanly
- [ ] App is notarized for distribution outside the App Store
- [ ] Installation works cleanly on a clean macOS system
- [ ] Uninstallation works cleanly

### Documentation
- [ ] README.md updated with macOS installation and usage instructions
- [ ] CHANGELOG.md complete for version 1.0.0
- [ ] All architecture documents reflect final implementation
- [ ] Known limitations documented (H.265 on some systems, unsupported video formats)

### Release
- [ ] `dev` merged to `main`
- [ ] `v1.0.0` tag applied and pushed
- [ ] .dmg installer artifact archived

---

## 5. Definition of Done — Future Platform Ports (Backlog)

When Windows or Linux porting is planned, each platform port is done when:

- [ ] Platform drive UUID resolution implemented and tested
- [ ] notify crate drive detection verified on target platform
- [ ] FFmpeg sidecar bundled and verified for target platform
- [ ] Webview codec behavior verified and documented
- [ ] `asset_open` and `asset_reveal` implemented for target platform
- [ ] Full workflow test completed on target platform
- [ ] Platform-specific installer builds cleanly
- [ ] Known platform limitations documented
- [ ] README updated with platform installation instructions

---

## 6. What Does NOT Block Done for Version 1.0.0

The following are explicitly not required for version 1.0.0:

- Windows support
- Linux support
- Backlog items (batch tagging, lossless clip export, concurrent indexing, etc.)
- i18n / localization
- Dark mode / theme support
- In-app update mechanism
- Telemetry or analytics (explicitly excluded by design)

---

## 7. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft |
| 1.1 | 2026-05-19 | Updated to macOS-first release strategy. Feature-level DoD updated to require macOS validation and platform abstraction rule. Sprint-level DoD updated to macOS build check. Release-level criteria updated to macOS only — Windows/Linux removed and moved to separate future port DoD section. |
