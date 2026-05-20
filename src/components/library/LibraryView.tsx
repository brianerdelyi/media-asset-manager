// Main library view — drive and indexing events handled globally in App.tsx

import { useEffect } from 'react';
import { useLibraryStore } from '../../stores/libraryStore';
import { AssetCard } from './AssetCard';
import { AssetDetailPanel } from './AssetDetailPanel';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import type { AssetSort } from '../../types/asset';

export function LibraryView() {
  const {
    results, total, page, pageSize, loading, error,
    filters, sort, selectedAsset, detailLoading,
    search, setFilters, setSort, setPage, selectAsset, clearSelection,
  } = useLibraryStore();

  useEffect(() => { search(); }, []);

  const totalPages = Math.ceil(total / pageSize);

  const sortOptions: { value: AssetSort; label: string }[] = [
    { value: { field: 'created_at_fs', direction: 'desc' }, label: 'Newest first' },
    { value: { field: 'created_at_fs', direction: 'asc' }, label: 'Oldest first' },
    { value: { field: 'filename', direction: 'asc' }, label: 'Filename A→Z' },
    { value: { field: 'filename', direction: 'desc' }, label: 'Filename Z→A' },
    { value: { field: 'file_size', direction: 'desc' }, label: 'Largest first' },
    { value: { field: 'file_size', direction: 'asc' }, label: 'Smallest first' },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-48 flex-shrink-0 bg-gray-950 border-r border-gray-800 p-4 overflow-y-auto">
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-950">
          <div className="flex-1">
            <SearchBar
              onSearch={(q) => setFilters({ query: q || undefined })}
              initialValue={filters.query ?? ''}
            />
          </div>
          <select
            value={JSON.stringify(sort)}
            onChange={e => setSort(JSON.parse(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded px-2 py-2 focus:outline-none"
          >
            {sortOptions.map(opt => (
              <option key={opt.label} value={JSON.stringify(opt.value)}>{opt.label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-600 flex-shrink-0">
            {total.toLocaleString()} asset{total !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded p-3 mb-4 text-sm text-red-400">{error}</div>
          )}
          {loading && results.length === 0 && (
            <div className="text-center py-16 text-gray-600"><p>Loading...</p></div>
          )}
          {!loading && results.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <p className="text-lg mb-1">No assets found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
          {results.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {results.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  isSelected={selectedAsset?.id === asset.id}
                  onClick={() => selectAsset(asset.id)}
                />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded disabled:opacity-40 hover:bg-gray-700"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded disabled:opacity-40 hover:bg-gray-700"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {(selectedAsset || detailLoading) && (
        <div className="w-72 flex-shrink-0">
          {detailLoading && (
            <div className="h-full bg-gray-900 border-l border-gray-800 flex items-center justify-center">
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          )}
          {selectedAsset && !detailLoading && (
            <AssetDetailPanel asset={selectedAsset} onClose={clearSelection} />
          )}
        </div>
      )}
    </div>
  );
}
