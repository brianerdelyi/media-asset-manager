# Definition of Done — Media Asset Manager

> Version: 1.0
> Status: Draft
> Stage: 4 — Implementation Planning
> Last Updated: 2026-05-19

---

## 1. Purpose

The Definition of Done (DoD) is the shared standard that must be met before any feature, fix, or task is considered complete. Nothing moves to the next sprint or is merged to `main` until all applicable criteria are satisfied.

---

## 2. Definition of Done — Feature Level

A feature is done when ALL of the following are true:

### Functionality
- [ ] All acceptance criteria from the corresponding user story are met
- [ ] The feature works correctly on macOS, Windows, and Linux
- [ ] The feature works correctly when relevant drives are offline (where applicable)
- [ ] All error states are handled gracefully — no unhandled exceptions or silent failures
- [ ] Destructive actions (delete, remove, purge) require user confirmation

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
- [ ] `dev` branch builds and runs cleanly on at least one platform
- [ ] Sprint version tag applied (e.g. `v0.2.0`)
- [ ] TODO.md updated to reflect completed and upcoming work
- [ ] Open questions or risks identified and documented

---

## 4. Definition of Done — Release Level

Version 1.0.0 is done when ALL of the following are true:

### All Features
- [ ] All 32 user stories (US-01 through US-32) meet feature-level DoD
- [ ] All functional requirements FR-01 through FR-111 implemented and verified

### Cross-Platform
- [ ] App installs and runs on Windows 10+
- [ ] App installs and runs on macOS 12+
- [ ] App installs and runs on Ubuntu 22.04+
- [ ] App runs on both x86_64 and ARM64 on macOS

### Performance
- [ ] App starts in under 3 seconds on average hardware
- [ ] Search returns results in under 1 second for 100,000 asset library
- [ ] Indexing processes minimum 200 files per minute on average hardware
- [ ] UI remains responsive during all background operations

### Installers
- [ ] macOS .dmg installer builds and installs cleanly
- [ ] Windows .msi installer builds and installs cleanly
- [ ] Linux .deb and .AppImage build and install cleanly
- [ ] Uninstallation works cleanly on all platforms

### Documentation
- [ ] README.md updated with installation and usage instructions
- [ ] CHANGELOG.md complete for version 1.0.0
- [ ] All architecture documents reflect final implementation
- [ ] Known limitations documented (e.g. H.265 playback on Windows)

### Release
- [ ] `dev` merged to `main`
- [ ] `v1.0.0` tag applied and pushed
- [ ] Installer artifacts archived

---

## 5. What Does NOT Block Done

The following are explicitly not required for a feature to be considered done in version 1.0.0:

- Backlog items (batch tagging, lossless clip export, concurrent indexing, etc.)
- i18n / localization
- Dark mode / theme support (unless added as a feature)
- In-app update mechanism
- Telemetry or analytics (explicitly excluded by design)

---

## 6. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft created during SDLC Stage 4 |
