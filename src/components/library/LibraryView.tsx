// Main library view — asset grid with search, filters, and detail view.

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useThemeStore } from '../../stores/themeStore';
import { AssetCard } from './AssetCard';
import { AssetDetailView } from '../detail/AssetDetailView';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import type { AssetSort } from '../../types/asset';

// Shared toolbar control styles — all controls use these as a base
const CTRL_HEIGHT = 28;
const CTRL_BASE: React.CSSProperties = {
  height: `${CTRL_HEIGHT}px`,
  background: 'var(--bg-raised)',
  border: '1px solid var(--border-default)',
  borderRadius: '6px',
  fontSize: '12px',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box' as const,
};

export function LibraryView() {
  const {
    results, total, page, pageSize, loading, error,
    filters, sort, selectedAsset, detailLoading,
    search, setFilters, setSort, setPage, selectAsset, clearSelection,
  } = useLibraryStore();

  const { filterPanelVisible, toggleFilterPanel } = useThemeStore();

  useEffect(() => { search(); }, []);

  const totalPages = Math.ceil(total / pageSize);

  const activeFilterCount = [
    filters.media_types?.length ?? 0,
    filters.drive_ids?.length ?? 0,
    filters.tag_ids?.length ?? 0,
    (filters.status && filters.status !== 'all') ? 1 : 0,
    filters.has_markers ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const hasFilters = activeFilterCount > 0;

  function clearAllFilters(e: React.MouseEvent) {
    e.stopPropagation();
    setFilters({ media_types: undefined, drive_ids: undefined, status: 'all', has_markers: undefined, tag_ids: undefined });
  }

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
        width: filterPanelVisible ? '180px' : '0',
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 0.2s ease',
        borderRight: filterPanelVisible ? '1px solid var(--border-subtle)' : 'none',
        background: 'var(--bg-app)',
      }}>
        <div style={{ width: '180px', overflowY: 'auto', height: '100%', padding: '16px' }}>
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Toolbar — all controls 28px tall, same border/radius/bg */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>

          {/* Filters button — fixed 108px, split into toggle + clear zone */}
          <div style={{
            ...CTRL_BASE,
            width: '108px', flexShrink: 0,
            overflow: 'hidden', gap: 0, padding: 0,
            background: filterPanelVisible ? 'var(--color-accent-subtle)' : 'var(--bg-raised)',
            borderColor: filterPanelVisible ? 'rgba(10,132,255,0.3)' : 'var(--border-default)',
            color: filterPanelVisible ? 'var(--color-accent)' : 'var(--text-secondary)',
          }}>
            {/* Toggle area */}
            <button
              onClick={toggleFilterPanel}
              title={filterPanelVisible ? 'Hide filters' : 'Show filters'}
              style={{
                flex: 1, height: '100%',
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '0 8px',
                background: 'none', border: 'none',
                borderRight: hasFilters ? '1px solid var(--border-subtle)' : 'none',
                color: 'inherit', cursor: 'pointer', fontSize: '12px',
              }}
            >
              <SlidersHorizontal size={13} />
              <span>Filters</span>
            </button>

            {/* Clear zone — fixed 28px, always same size */}
            <div style={{
              width: '28px', height: '100%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  title={`Clear ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''}`}
                  style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-accent)',
                    fontSize: '10px', fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    el.style.background = 'rgba(255,69,58,0.1)';
                    el.style.color = 'var(--color-danger)';
                    el.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    el.style.background = 'none';
                    el.style.color = 'var(--color-accent)';
                    el.innerHTML = String(activeFilterCount);
                  }}
                >
                  {activeFilterCount}
                </button>
              )}
            </div>
          </div>

          {/* Search — flex fills remaining space, same height */}
          <div style={{ flex: 1 }}>
            <SearchBar
              onSearch={(q) => setFilters({ query: q || undefined })}
              initialValue={filters.query ?? ''}
            />
          </div>

          {/* Sort — same height, same style as filter button */}
          <select
            value={JSON.stringify(sort)}
            onChange={e => setSort(JSON.parse(e.target.value))}
            style={{
              ...CTRL_BASE,
              padding: '0 8px',
              flexShrink: 0,
              outline: 'none',
              appearance: 'auto',
            }}
          >
            {sortOptions.map(opt => (
              <option key={opt.label} value={JSON.stringify(opt.value)}>{opt.label}</option>
            ))}
          </select>

          {/* Asset count — plain muted text, no border/background */}
          <span style={{
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            lineHeight: `${CTRL_HEIGHT}px`,
          }}>
            {total.toLocaleString()} {total === 1 ? 'asset' : 'assets'}
          </span>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {error && (
            <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--color-danger)' }}>
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

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              <button
                onClick={() => setPage(page - 1)} disabled={page <= 1}
                style={{ ...CTRL_BASE, gap: '4px', padding: '0 10px', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)} disabled={page >= totalPages}
                style={{ ...CTRL_BASE, gap: '4px', padding: '0 10px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}
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
