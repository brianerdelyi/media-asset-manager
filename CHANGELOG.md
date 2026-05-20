# Changelog

All notable changes to this project will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] - 2026-05-19

### Added
- Tauri 2.x + React 18 + TypeScript project scaffold
- Vite build system with pnpm package manager
- Tailwind CSS configuration (pending Sprint 2)
- Correct app identifier: com.brianerdelyi.mediaassetmanager
- Correct product name: Media Asset Manager
- Window configuration: 1280x800 default, 900x600 minimum
- Platform abstraction module stub (src-tauri/src/drives/platform.rs) — pending Sprint 2
- All SDLC documentation restored alongside scaffold (docs/)
- .gitignore configured for Rust, Node, and runtime-generated files

### Notes
- First successful build on macOS ARM64 (Apple Silicon)
- Initial Rust compilation: ~2 minutes (subsequent builds: seconds)
- SQLite integration and DB migrations planned for Sprint 1 completion

---

## [Unreleased - Pre-scaffold]

### Added
- Project initialized
- Folder structure created
- SDLC process started — Stages 1 through 4 complete and approved
