// Main library view — infinite scroll asset grid with size control and filters.

import { useEffect, useRef } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useThemeStore, type CardSize, CARD_SIZE_PX } from '../../stores/themeStore';
import { useTranscriptionStore } from '../../stores/transcriptionStore';
import { useIndexingStore } from '../../stores/indexingStore';
import { AssetCard } from './AssetCard';
import { AssetDetailView } from '../detail/AssetDetailView';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { SortDropdown } from '../common/SortDropdown';
import type { AssetSort } from '../../types/asset';

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

const STATUS_BAR_HEIGHT = 28;
const SIZE_LABELS: CardSize[] = ['S', 'M', 'L'];

export function LibraryView() {
  const {
    results, total, hasMore, loading, loadingMore, error,
    filters, sort, selectedAsset, detailLoading,
    search, loadMore, setFilters, setSort, selectAsset, clearSelection,
  } = useLibraryStore();

  const { filterPanelVisible, toggleFilterPanel, cardSize, setCardSize } = useThemeStore();
  const { activeJob: txJob } = useTranscriptionStore();
  const { currentJob: indexJob } = useIndexingStore();

  const statusBarRows = (txJob ? 1 : 0) + (indexJob && indexJob.status === 'running' ? 1 : 0);
  const statusBarHeight = statusBarRows > 0 ? statusBarRows * STATUS_BAR_HEIGHT : 0;

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { search(); }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, results.length]);

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
    return (
      <div style={{ height: '100%', paddingBottom: statusBarHeight, boxSizing: 'border-box' }}>
        <AssetDetailView asset={selectedAsset} onClose={clearSelection} />
      </div>
    );
  }

  if (detailLoading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Loading…</p>
      </div>
    );
  }

  const minCardPx = CARD_SIZE_PX[cardSize];

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', paddingBottom: statusBarHeight, boxSizing: 'border-box' }}>

      {/* Filter sidebar */}
      <div style={{
        width: filterPanelVisible ? '180px' : '0',
        flexShrink: 0, overflow: 'hidden',
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

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          {/* Filters button */}
          <div style={{
            ...CTRL_BASE, width: '108px', flexShrink: 0,
            overflow: 'hidden', gap: 0, padding: 0,
            background: filterPanelVisible ? 'var(--color-accent-subtle)' : 'var(--bg-raised)',
            borderColor: filterPanelVisible ? 'rgba(10,132,255,0.3)' : 'var(--border-default)',
            color: filterPanelVisible ? 'var(--color-accent)' : 'var(--text-secondary)',
          }}>
            <button onClick={toggleFilterPanel} title={filterPanelVisible ? 'Hide filters' : 'Show filters'}
              style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', gap: '5px', padding: '0 8px', background: 'none', border: 'none', borderRight: hasFilters ? '1px solid var(--border-subtle)' : 'none', color: 'inherit', cursor: 'pointer', fontSize: '12px' }}>
              <SlidersHorizontal size={13} />
              <span>Filters</span>
            </button>
            <div style={{ width: '28px', height: '100%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hasFilters && (
                <button onClick={clearAllFilters}
                  title={`Clear ${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''}`}
                  style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', fontSize: '10px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,69,58,0.1)'; el.style.color = 'var(--color-danger)'; el.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'none'; el.style.color = 'var(--color-accent)'; el.innerHTML = String(activeFilterCount); }}
                >
                  {activeFilterCount}
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div style={{ flex: 1 }}>
            <SearchBar onSearch={(q) => setFilters({ query: q || undefined })} initialValue={filters.query ?? ''} />
          </div>

          {/* Sort */}
          <SortDropdown options={sortOptions} value={sort} onChange={setSort} serialize={v => JSON.stringify(v)} />

          {/* Card size — S / M / L segmented control */}
          <div style={{ display: 'flex', height: '28px', flexShrink: 0, border: '1px solid var(--border-default)', borderRadius: '6px', overflow: 'hidden' }}>
            {SIZE_LABELS.map((s, i) => (
              <button key={s} onClick={() => setCardSize(s)}
                title={{ S: 'Small cards', M: 'Medium cards', L: 'Large cards' }[s]}
                style={{
                  width: '28px', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: cardSize === s ? 'var(--color-accent)' : 'var(--bg-raised)',
                  color: cardSize === s ? '#fff' : 'var(--text-tertiary)',
                  border: 'none',
                  borderLeft: i > 0 ? '1px solid var(--border-default)' : 'none',
                  cursor: 'pointer', fontSize: '11px', fontWeight: 500,
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Asset count */}
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {total.toLocaleString()} {total === 1 ? 'asset' : 'assets'}
          </span>
        </div>

        {/* Grid — infinite scroll */}
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, minmax(${minCardPx}px, 1fr))`,
              gap: '12px',
            }}>
              {results.map(asset => (
                <AssetCard key={asset.id} asset={asset} cardSize={cardSize} isSelected={false} onClick={() => selectAsset(asset.id)} />
              ))}
            </div>
          )}

          {/* Scroll sentinel */}
          <div ref={sentinelRef} style={{ height: '1px' }} />

          {loadingMore && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-tertiary)' }}>
              <p style={{ fontSize: '12px', margin: 0 }}>Loading…</p>
            </div>
          )}

          {!hasMore && results.length > 0 && total > results.length && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                All {total.toLocaleString()} assets loaded
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
