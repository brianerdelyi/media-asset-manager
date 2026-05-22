import { invoke } from '@tauri-apps/api/core';

export interface LibraryStats { total_assets: number; total_video: number; total_image: number; total_audio: number; total_size_bytes: number; orphaned_assets: number; missing_locations: number; thumbnail_count: number; total_markers: number; total_tags: number; }
export async function getStats(): Promise<LibraryStats> { return invoke<LibraryStats>('settings_get_stats'); }
export async function getSetting(key: string): Promise<string | null> { return invoke<string | null>('settings_get', { key }); }
export async function setSetting(key: string, value: string): Promise<void> { return invoke<void>('settings_set', { key, value }); }
export async function getAssetNames(): Promise<Record<string, string>> { return invoke<Record<string, string>>('settings_get_asset_names'); }
export async function deleteOrphanedAssets(): Promise<number> { return invoke<number>('settings_delete_orphaned'); }
export async function purgeThumbnails(): Promise<number> { return invoke<number>('settings_purge_thumbnails'); }
