# Sprint 10 — Tags and Asset Metadata

**Version:** 1.0
**Date:** 2026-05-22
**Status:** Ready to begin
**Branch:** `dev`

---

## Goal

Add tag management and apply-to-asset functionality, plus editable Description and Location fields on assets. Both features are independent of transcription and can ship as a complete unit.

---

## Scope

| Milestone | Scope |
|---|---|
| 10A | Tags — backend commands + frontend UI |
| 10B | Asset metadata — Description + Location fields |

---

## Prerequisites

- Sprint 9 complete ✅
- `tags` and `asset_tags` tables exist in migration 001 ✅
- `settings` table exists ✅
- Asset Name pattern already implemented — Description/Location follow the same approach ✅

---

## 10A — Tags

### Backend Tasks

**New file: `src-tauri/src/commands/tags.rs`**

- [ ] `tag_list` — returns all tags ordered by `name_display`, includes `asset_count` per tag
- [ ] `tag_create(name)` — normalises name (lowercase, trimmed), rejects duplicates, returns `Tag`
- [ ] `tag_delete(tag_id)` — deletes tag and cascades to `asset_tags`
- [ ] `asset_tags_set(asset_id, tag_ids)` — replaces all tags for asset in a single transaction; preferred over individual add/remove for simplicity

**Update: `src-tauri/src/commands/mod.rs`**
- [ ] Add `pub mod tags;`

**Update: `src-tauri/src/lib.rs`**
- [ ] Register `tag_list`, `tag_create`, `tag_delete`, `asset_tags_set`

**Update: `src-tauri/src/assets/mod.rs`**
- [ ] Extend `search_assets` to filter by `tag_ids` when present in filters (already in `AssetSearchFilters` struct — just needs the SQL clause)

### Frontend Tasks

**New file: `src/commands/tags.ts`**
- [ ] `listTags()` → `Tag[]`
- [ ] `createTag(name)` → `Tag`
- [ ] `deleteTag(tagId)` → `void`
- [ ] `setAssetTags(assetId, tagIds)` → `void`

**New file: `src/stores/tagStore.ts`**
- [ ] Zustand store — `tags: Tag[]`, `fetchTags()`, `createTag()`, `deleteTag()`
- [ ] Auto-refresh after create/delete

**New file: `src/components/common/TagPicker.tsx`**
- [ ] Dropdown showing all existing tags with checkboxes
- [ ] Selected tags shown as pills above the list
- [ ] Inline tag creation — text input at bottom of dropdown, Enter to create
- [ ] Click outside to close
- [ ] Uses CSS variables — no hardcoded colours

**New file: `src/components/common/TagBadge.tsx`**
- [ ] Small pill: tag name, × to remove
- [ ] Neutral colour using `--bg-raised` and `--border-default`

**Update: `src/components/detail/AssetDetailView.tsx`**
- [ ] Add Tags section in right panel below Locations
- [ ] Shows current tags as `TagBadge` pills
- [ ] "+ Tag" button opens `TagPicker`
- [ ] On tag selection change — calls `setAssetTags`, refreshes asset

**Update: `src/components/library/FilterPanel.tsx`**
- [ ] Add Tags section below Markers filter
- [ ] Lists all tags as checkboxes (loaded from `tagStore`)
- [ ] Selected tags passed to `libraryStore.setFilters({ tag_ids: [...] })`

**Update: `src/stores/libraryStore.ts`**
- [ ] `tag_ids` already in `AssetSearchFilters` — ensure it is passed through to `searchAssets`

### Acceptance Criteria

- [ ] Create a tag from the asset detail pane
- [ ] Apply multiple tags to an asset
- [ ] Tags display as pills in the detail pane
- [ ] Remove a tag from an asset — tag itself is not deleted
- [ ] Tags persist after closing and reopening the asset
- [ ] Filter panel shows all tags as checkboxes
- [ ] Filtering by one tag returns only assets with that tag
- [ ] Filtering by two tags returns only assets with both tags (AND logic)
- [ ] Tag filter combines correctly with type and drive filters

---

## 10B — Asset Metadata Fields

### Backend Tasks

**Update: `src-tauri/src/commands/settings.rs`**
- [ ] `settings_get_asset_metadata()` — bulk fetch returns `HashMap<asset_id, { description, location }>` using `SELECT key, value FROM settings WHERE key LIKE 'asset_description:%' OR key LIKE 'asset_location:%'`

**Update: `src-tauri/src/assets/mod.rs`**
- [ ] Extend `search_assets` — when `query` is present, also search `settings` table for `asset_description:%` and `asset_location:%` values matching the query. Return assets where filename, description, or location matches.

**Update: `src-tauri/src/lib.rs`**
- [ ] Register `settings_get_asset_metadata`

### Frontend Tasks

**Update: `src/commands/settings.ts`**
- [ ] Add `getAssetMetadata()` → `Record<string, { description: string; location: string }>`

**Update: `src/stores/libraryStore.ts`**
- [ ] Add `assetMetadata: Record<string, { description: string; location: string }>` to store
- [ ] Load alongside `assetNames` after search — single bulk fetch, non-blocking
- [ ] Refresh on `refreshSelected()`

**Update: `src/components/detail/AssetDetailView.tsx`**
- [ ] Add **Description** multi-line textarea below Asset Name
  - Click to edit, blur/Enter saves, Escape cancels
  - Auto-expands with content (min 3 rows)
  - Placeholder: "Add a description…"
  - Saves via `setSetting('asset_description:<id>', value)`
- [ ] Add **Location** single-line input below Description
  - Same edit/save/cancel pattern as Asset Name
  - Placeholder: "Add a location…"
  - Saves via `setSetting('asset_location:<id>', value)`
- [ ] Both fields load saved values via `getSetting` on asset open

### Acceptance Criteria

- [ ] Description field visible in asset detail pane
- [ ] Location field visible in asset detail pane
- [ ] Both fields are editable with click-to-edit interaction
- [ ] Values persist after closing and reopening the asset
- [ ] Escape reverts to previous value
- [ ] Search bar returns assets matching description content
- [ ] Search bar returns assets matching location content

---

## Definition of Done

- All acceptance criteria pass
- No TypeScript errors (`tsc` clean)
- No hardcoded Tailwind colour classes introduced
- All new Rust commands registered in `lib.rs`
- `pnpm tauri dev` hot-reloads without errors
- Committed to `dev` branch with descriptive commit messages

---

## Estimated Complexity

| Task | Complexity |
|---|---|
| Tag backend commands | Low |
| TagPicker component | Medium |
| TagBadge + detail pane integration | Low |
| Filter panel tags section | Low |
| Metadata backend | Low |
| Description + Location fields | Low |
| Search extension for description/location | Medium |

**Overall: Medium — 2–3 days estimated**

---

## Out of Scope for This Sprint

- Tag rename / global tag management screen (backlog)
- Tag colours (backlog)
- Transcript search (Sprint 12)
- Any transcription features (Sprint 11–12)
