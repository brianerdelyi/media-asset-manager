// Typed Tauri command wrappers for asset operations.

import { invoke } from '@tauri-apps/api/core';
import type {
  AssetDetail,
  AssetSearchFilters,
  AssetSearchResult,
  AssetSort,
} from '../types/asset';

export async function searchAssets(
  filters: AssetSearchFilters = {},
  sort?: AssetSort,
  page = 1,
  pageSize = 50,
): Promise<AssetSearchResult> {
  return invoke<AssetSearchResult>('asset_search', { filters, sort, page, pageSize });
}

export async function getAsset(assetId: string): Promise<AssetDetail> {
  return invoke<AssetDetail>('asset_get', { assetId });
}

export async function deleteAsset(assetId: string): Promise<void> {
  return invoke<void>('asset_delete', { assetId });
}

export async function openAsset(assetId: string, locationId: string): Promise<void> {
  return invoke<void>('asset_open', { assetId, locationId });
}

export async function revealAsset(assetId: string, locationId: string): Promise<void> {
  return invoke<void>('asset_reveal', { assetId, locationId });
}
