# Coding Standards — Media Asset Manager

> Version: 1.0
> Status: Draft
> Stage: 4 — Implementation Planning
> Last Updated: 2026-05-19

---

## 1. General Principles

- Prefer simple, readable code over clever abstractions
- Write code that is easy for AI-assisted tools to read, extend, and debug
- Every function and module should do one thing clearly
- Avoid premature optimization — measure before optimizing
- All production code must have at least one corresponding test
- Prefer explicit over implicit — avoid magic values, hidden side effects, and implicit state

---

## 2. Project Structure

```
media-asset-manager/
├── src/                          # React frontend source
│   ├── components/               # Reusable UI components
│   │   ├── common/               # Buttons, inputs, modals, icons
│   │   ├── library/              # Asset grid, asset card, filters
│   │   ├── detail/               # Asset detail view, video player, markers
│   │   ├── drives/               # Drive list, register dialog
│   │   ├── tags/                 # Tag picker, tag management screen
│   │   └── settings/             # Settings screen
│   ├── stores/                   # Zustand stores
│   │   ├── libraryStore.ts
│   │   ├── driveStore.ts
│   │   ├── indexingStore.ts
│   │   ├── settingsStore.ts
│   │   └── uiStore.ts
│   ├── hooks/                    # Custom React hooks
│   ├── commands/                 # Tauri command wrappers (typed)
│   │   ├── drives.ts
│   │   ├── assets.ts
│   │   ├── tags.ts
│   │   ├── markers.ts
│   │   ├── indexing.ts
│   │   └── settings.ts
│   ├── types/                    # Shared TypeScript types
│   │   ├── asset.ts
│   │   ├── drive.ts
│   │   ├── tag.ts
│   │   ├── marker.ts
│   │   └── api.ts
│   ├── utils/                    # Pure utility functions
│   ├── App.tsx                   # Root component and routing
│   └── main.tsx                  # Entry point
├── src-tauri/                    # Rust backend source
│   ├── src/
│   │   ├── main.rs               # Tauri app entry point
│   │   ├── commands/             # Tauri command handlers
│   │   │   ├── drives.rs
│   │   │   ├── assets.rs
│   │   │   ├── tags.rs
│   │   │   ├── markers.rs
│   │   │   ├── indexing.rs
│   │   │   └── settings.rs
│   │   ├── db/                   # Database layer
│   │   │   ├── mod.rs
│   │   │   ├── connection.rs
│   │   │   ├── migrations.rs
│   │   │   └── migrations/       # SQL migration files
│   │   │       └── 001_initial_schema.sql
│   │   ├── indexer/              # Indexing engine
│   │   │   ├── mod.rs
│   │   │   ├── walker.rs         # Directory walker
│   │   │   ├── hasher.rs         # Fingerprint computation
│   │   │   ├── metadata.rs       # FFmpeg metadata extraction
│   │   │   └── thumbnails.rs     # Thumbnail generation
│   │   ├── drives/               # Drive management and watching
│   │   │   ├── mod.rs
│   │   │   ├── manager.rs
│   │   │   └── watcher.rs
│   │   ├── library/              # Library and settings management
│   │   │   ├── mod.rs
│   │   │   └── manager.rs
│   │   ├── models/               # Rust data structs matching DB schema
│   │   │   ├── asset.rs
│   │   │   ├── drive.rs
│   │   │   ├── location.rs
│   │   │   ├── tag.rs
│   │   │   └── marker.rs
│   │   └── error.rs              # AppError type and error codes
│   ├── binaries/                 # FFmpeg sidecar binaries
│   │   ├── ffmpeg-macos-x86_64
│   │   ├── ffmpeg-macos-arm64
│   │   ├── ffmpeg-windows-x86_64.exe
│   │   └── ffmpeg-linux-x86_64
│   └── tauri.conf.json
├── tests/                        # Integration and E2E tests
├── docs/                         # Project documentation
└── scripts/                      # Build and utility scripts
```

---

## 3. Naming Conventions

### 3.1 TypeScript / React

| Element | Convention | Example |
|---|---|---|
| Components | PascalCase | `AssetCard`, `DriveList` |
| Hooks | camelCase with `use` prefix | `useLibraryStore`, `useDriveStatus` |
| Stores | camelCase with `Store` suffix | `libraryStore`, `driveStore` |
| Types / Interfaces | PascalCase | `Asset`, `DriveRecord`, `MarkerType` |
| Enums | PascalCase | `MediaType`, `MarkerKind` |
| Functions | camelCase | `formatDuration`, `resolveThumbPath` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_PAGE_SIZE`, `SUPPORTED_VIDEO_FORMATS` |
| Files — components | PascalCase | `AssetCard.tsx`, `DriveList.tsx` |
| Files — other | camelCase | `libraryStore.ts`, `formatters.ts` |
| Tauri command wrappers | camelCase matching command name | `registerDrive()`, `startIndexing()` |

### 3.2 Rust

| Element | Convention | Example |
|---|---|---|
| Modules | snake_case | `drive_manager`, `metadata_extractor` |
| Functions | snake_case | `compute_fingerprint`, `register_drive` |
| Structs | PascalCase | `AssetRecord`, `DriveInfo` |
| Enums | PascalCase | `MediaType`, `MarkerKind`, `AppError` |
| Constants | SCREAMING_SNAKE_CASE | `HASH_CHUNK_SIZE`, `THUMBNAIL_QUALITY` |
| Tauri commands | snake_case | `drive_register`, `index_start` |
| Files | snake_case | `hasher.rs`, `drive_manager.rs` |

### 3.3 Database

| Element | Convention | Example |
|---|---|---|
| Tables | snake_case, plural | `assets`, `asset_tags`, `schema_migrations` |
| Columns | snake_case | `asset_id`, `created_at_fs`, `is_orphaned` |
| Indexes | `idx_{table}_{column(s)}` | `idx_assets_fingerprint`, `idx_locations_drive_id` |
| Migrations | Zero-padded sequential numbers | `001_initial_schema.sql` |

---

## 4. TypeScript Standards

- **Strict mode** enabled in `tsconfig.json` — no implicit any
- All Tauri command responses typed with explicit interfaces in `src/types/`
- All Tauri commands wrapped in typed functions in `src/commands/` — never call `invoke()` directly from components
- No `any` types — use `unknown` with type guards where necessary
- Prefer `interface` over `type` for object shapes
- Use `enum` for finite sets of values (MediaType, MarkerKind)
- Async functions always use `async/await` — no raw Promise chains
- All errors from Tauri commands caught and handled explicitly

### Example Command Wrapper

```typescript
// src/commands/drives.ts
import { invoke } from '@tauri-apps/api/core';
import { DriveRecord, DriveRemovePreview } from '../types/drive';
import { AppError } from '../types/api';

export async function registerDrive(path: string, friendlyName: string): Promise<DriveRecord> {
  return invoke<DriveRecord>('drive_register', { path, friendlyName });
}

export async function removeDrive(driveId: string): Promise<DriveRemovePreview> {
  return invoke<DriveRemovePreview>('drive_remove', { driveId });
}
```

---

## 5. React Standards

- Functional components only — no class components
- One component per file
- Props interfaces defined above the component in the same file
- No inline styles — Tailwind classes only
- Complex conditional rendering extracted to helper functions or sub-components
- Side effects in `useEffect` with explicit dependency arrays — no empty array shortcuts without a comment explaining why
- Event handlers named `handle{Event}` — e.g. `handleSearch`, `handleTagRemove`
- All user-facing strings in component — no string constants scattered across files (i18n not required for MVP but keep strings co-located)

---

## 6. Rust Standards

- All Tauri command handlers in `src-tauri/src/commands/` — thin wrappers that delegate to domain modules
- No business logic in command handlers — logic lives in domain modules (`indexer/`, `drives/`, `library/`)
- All Tauri commands return `Result<T, AppError>` — never unwrap or panic in command handlers
- Use `thiserror` crate for AppError derivation
- All database operations in the `db/` module — no raw SQL in command handlers or domain modules
- Use `rusqlite` with named parameters — never string-formatted SQL
- Async functions use `tokio` runtime — no blocking calls on async threads
- Long-running operations spawn separate Tokio tasks — never block the command handler
- `CancellationToken` pattern for all cancellable background tasks
- All public functions have doc comments (`///`)

### Example Command Handler

```rust
// src-tauri/src/commands/drives.rs
#[tauri::command]
pub async fn drive_register(
    state: tauri::State<'_, AppState>,
    path: String,
    friendly_name: String,
) -> Result<DriveRecord, AppError> {
    drives::manager::register_drive(&state.db, &path, &friendly_name).await
}
```

---

## 7. Testing Expectations

### 7.1 Rust (Backend)
- Unit tests for: Hasher, Metadata Extractor, tag normalization, path normalization, orphan detection logic, migration runner
- Integration tests for: Tauri commands against an in-memory SQLite database
- Test file co-located with source using `#[cfg(test)]` module
- All error paths tested — not just happy paths

### 7.2 TypeScript (Frontend)
- Unit tests for: utility functions, store state transitions, command wrapper error handling
- Component tests for: search bar, filter panel, tag picker, marker list (using Vitest + Testing Library)
- No snapshot tests — test behavior not markup
- Mock Tauri `invoke()` in all frontend tests

### 7.3 Coverage Expectations
- Rust backend: aim for >70% line coverage on business logic modules
- TypeScript: aim for >60% on stores and utility functions
- All critical paths (indexing, duplicate detection, orphan detection, drive removal) must have explicit tests

---

## 8. Documentation Expectations

- All public Rust functions have `///` doc comments describing purpose, parameters, and return value
- All Tauri commands have a doc comment explaining their purpose and any important side effects
- All Zustand stores have a comment block at the top describing their responsibility
- Complex algorithms (hasher, incremental index logic, orphan detection) have inline comments explaining the approach
- No commented-out code in committed files — use git history instead
- `CHANGELOG.md` updated with every meaningful commit using Keep a Changelog format

---

## 9. Linting and Formatting

### TypeScript / React
- **ESLint** with `@typescript-eslint` rules
- **Prettier** for formatting — single quotes, 2-space indent, trailing commas
- No unused variables or imports (ESLint error, not warning)
- Run before every commit: `pnpm lint && pnpm format`

### Rust
- **rustfmt** for formatting — default settings
- **Clippy** for linting — treat warnings as errors in CI: `cargo clippy -- -D warnings`
- Run before every commit: `cargo fmt && cargo clippy`

---

## 10. Environment and Secrets

- No secrets, API keys, or tokens in source code
- No `.env` files committed to git
- App has no network access — no secrets required for core functionality
- FFmpeg binary paths resolved at runtime via Tauri sidecar API — not hardcoded

---

## 11. Incremental Index Clarification

During incremental re-indexing, files are skipped based on filesystem metadata before reaching the hash step. The rule is:

> A file is skipped if its size AND modification date match the existing location record for that path.

If a file passes this check (it is new or its metadata has changed), it proceeds to full hash computation. This means:
- Every file that is actually processed during indexing always gets a full partial hash computed
- The incremental check is a filesystem-metadata skip — not a hash skip
- All assets in the database always have a populated fingerprint

---

## 12. Document History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-19 | Initial draft created during SDLC Stage 4 |
