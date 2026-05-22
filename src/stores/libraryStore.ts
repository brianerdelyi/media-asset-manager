// Library store — manages asset search results, filters, selected asset, and asset name overrides.

import { create } from 'zustand';
import type { AssetDetail, AssetSearchFilters, AssetSearchResult, AssetSort, AssetSummary } from '../types/asset';
import { searchAssets, getAsset, deleteAsset } from '../commands/assets';
import { getAssetNames } from '../commands/settings';

interface LibraryStore {
  results: AssetSummary[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  filters: AssetSearchFilters;
  sort: AssetSort;
  selectedAsset: AssetDetail | null;
  detailLoading: boolean;
  // Map of asset_id -> custom name (from settings table)
  assetNames: Record<string, string>;

  search: () => Promise<void>;
  setFilters: (filters: Partial<AssetSearchFilters>) => void;
  setSort: (sort: AssetSort) => void;
  setPage: (page: number) => void;
  selectAsset: (assetId: string) => Promise<void>;
  clearSelection: () => void;
  removeAsset: (assetId: string) => Promise<void>;
  refreshSelected: () => Promise<void>;
  refreshAssetNames: () => Promise<void>;
}

const DEFAULT_SORT: AssetSort = { field: 'created_at_fs', direction: 'desc' };

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  results: [],
  total: 0,
  page: 1,
  pageSize: 50,
  loading: false,
  error: null,
  filters: {},
  sort: DEFAULT_SORT,
  selectedAsset: null,
  detailLoading: false,
  assetNames: {},

  search: async () => {
    const { filters, sort, page, pageSize } = get();
    set({ loading: true, error: null });
    try {
      const result: AssetSearchResult = await searchAssets(filters, sort, page, pageSize);
      set({ results: result.data, total: result.total, loading: false });
      // Load asset name overrides in parallel — don't block the grid
      getAssetNames().then(names => set({ assetNames: names })).catch(() => {});
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  setFilters: (newFilters) => {
    set(state => ({ filters: { ...state.filters, ...newFilters }, page: 1 }));
    get().search();
  },

  setSort: (sort) => { set({ sort, page: 1 }); get().search(); },
  setPage: (page) => { set({ page }); get().search(); },

  selectAsset: async (assetId) => {
    set({ detailLoading: true });
    try {
      const asset = await getAsset(assetId);
      set({ selectedAsset: asset, detailLoading: false });
    } catch (e) {
      set({ detailLoading: false });
    }
  },

  clearSelection: () => set({ selectedAsset: null }),

  removeAsset: async (assetId) => {
    await deleteAsset(assetId);
    set(state => ({
      results: state.results.filter(a => a.id !== assetId),
      total: state.total - 1,
      selectedAsset: state.selectedAsset?.id === assetId ? null : state.selectedAsset,
    }));
  },

  refreshSelected: async () => {
    const { selectedAsset } = get();
    if (!selectedAsset) return;
    try {
      const asset = await getAsset(selectedAsset.id);
      set({ selectedAsset: asset });
    } catch (_) {}
    // Also refresh asset names in case one was just saved
    getAssetNames().then(names => set({ assetNames: names })).catch(() => {});
  },

  refreshAssetNames: async () => {
    try {
      const names = await getAssetNames();
      set({ assetNames: names });
    } catch (_) {}
  },
}));
