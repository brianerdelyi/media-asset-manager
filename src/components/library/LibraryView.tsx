// Main library view — asset grid with search, filters, and detail view.

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { AssetCard } from './AssetCard';
import { AssetDetailView } from '../detail/AssetDetailView';
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
    { value: { field: 'created_at_fs', direction: 'asc' },  label: 'Oldest first' },
    { value: { field: 'filename',      direction: 'asc' },  label: 'Filename A→Z' },
    { value: { field: 'filename',      direction: 'desc' }, label: 'Filename Z→A' },
    { value: { field: 'file_size',     direction: 'desc' }, label: 'Largest first' },
    { value: { field: 'file_size',     direction: 'asc' },  label: 'Smallest first' },
  ];

  if (selectedAsset) {
    return <AssetDetailView asset={selectedAsset} onClose={clearSelection} />;
  }

  if (detailLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Filter sidebar */}
      <div style={{
        width: '180px', flexShrink: 0, overflowY: 'auto',
        padding: '16px',
        background: 'var(--bg-app)',
        borderRight: '1px solid var(--border-subtle)',
      }}>
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 16px',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <SearchBar
              onSearch={(q) => setFilters({ query: q || undefined })}
              initialValue={filters.query ?? ''}
            />
          </div>
          <select
            value={JSON.stringify(sort)}
            onChange={e => setSort(JSON.parse(e.target.value))}
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {sortOptions.map(opt => (
              <option key={opt.label} value={JSON.stringify(opt.value)}>{opt.label}</option>
            ))}
          </select>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
            {total.toLocaleString()} asset{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {error && (
            <div style={{
              background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)',
              borderRadius: '6px', padding: '10px 14px', marginBottom: '16px',
              fontSize: '13px', color: 'var(--color-danger)',
            }}>
              {error}
            </div>
          )}

          {loading && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-tertiary)' }}>
              <p style={{ fontSize: '13px', margin: 0 }}>Loading…</p>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>No assets found</p>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>Try adjusting your search or filters</p>
            </div>
          )}

          {results.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {results.map(asset => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  isSelected={false}
                  onClick={() => selectAsset(asset.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '5px 10px', fontSize: '12px',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '5px 10px', fontSize: '12px',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.4 : 1,
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
