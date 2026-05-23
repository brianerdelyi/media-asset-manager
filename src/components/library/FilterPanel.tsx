// Filter panel — collapsible sections with search for tags.
// Shows static asset counts per filter option (Option A faceted search).
// "Clear all" lives in the toolbar (LibraryView) not here.

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDriveStore } from '../../stores/driveStore';
import { useTagStore } from '../../stores/tagStore';
import { getFilterCounts, type FilterCounts } from '../../commands/settings';
import type { AssetSearchFilters } from '../../types/asset';

interface FilterPanelProps {
  filters: AssetSearchFilters;
  onChange: (filters: Partial<AssetSearchFilters>) => void;
}

type SectionId = 'type' | 'status' | 'markers' | 'drive' | 'tags';

const DEFAULT_OPEN: Record<SectionId, boolean> = {
  type: true, status: false, markers: false, drive: false, tags: true,
};

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const { drives } = useDriveStore();
  const { tags, fetchTags } = useTagStore();
  const [open, setOpen] = useState<Record<SectionId, boolean>>(DEFAULT_OPEN);
  const [tagQuery, setTagQuery] = useState('');
  const [counts, setCounts] = useState<FilterCounts | null>(null);

  useEffect(() => {
    fetchTags();
    getFilterCounts().then(setCounts).catch(() => {});
  }, []);

  function toggle(id: SectionId) {
    setOpen(o => ({ ...o, [id]: !o[id] }));
  }

  function toggleMediaType(type: string) {
    const current = filters.media_types ?? [];
    const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
    onChange({ media_types: updated.length > 0 ? updated : undefined });
  }

  function toggleDrive(driveId: string) {
    const current = filters.drive_ids ?? [];
    const updated = current.includes(driveId) ? current.filter(d => d !== driveId) : [...current, driveId];
    onChange({ drive_ids: updated.length > 0 ? updated : undefined });
  }

  function toggleTag(tagId: string) {
    const current = filters.tag_ids ?? [];
    const updated = current.includes(tagId) ? current.filter(id => id !== tagId) : [...current, tagId];
    onChange({ tag_ids: updated.length > 0 ? updated : undefined });
  }

  const filteredTags = tagQuery.trim()
    ? tags.filter(t => t.name_normalized.includes(tagQuery.trim().toLowerCase()))
    : tags;

  const activeTagCount = filters.tag_ids?.length ?? 0;
  const statusIsActive = filters.status === 'orphaned' || filters.status === 'missing';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Type */}
      <Section id="type" label="Type" open={open.type} onToggle={() => toggle('type')}>
        {['video', 'image', 'audio'].map(type => (
          <FilterCheckbox
            key={type}
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            checked={filters.media_types?.includes(type) ?? false}
            onChange={() => toggleMediaType(type)}
            count={counts?.by_type[type]}
          />
        ))}
      </Section>

      {/* Status */}
      <Section id="status" label="Status" open={open.status} onToggle={() => toggle('status')}>
        <FilterRadio label="All" name="status"
          checked={(filters.status ?? 'all') === 'all'}
          onChange={() => onChange({ status: 'all' })} />
        <FilterRadio label="Orphaned" name="status"
          checked={filters.status === 'orphaned'}
          onChange={() => onChange({ status: 'orphaned' })}
          count={counts?.orphaned} />
        <FilterRadio label="Missing" name="status"
          checked={filters.status === 'missing'}
          onChange={() => onChange({ status: 'missing' })}
          count={counts?.missing} />
      </Section>

      {/* Markers */}
      <Section id="markers" label="Markers" open={open.markers} onToggle={() => toggle('markers')}>
        <FilterCheckbox
          label="Has markers"
          checked={filters.has_markers ?? false}
          onChange={e => onChange({ has_markers: e.target.checked || undefined })}
          count={counts?.has_markers}
        />
      </Section>

      {/* Tags */}
      <Section id="tags" label="Tags" open={open.tags} onToggle={() => toggle('tags')}>
        {activeTagCount > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
            {(filters.tag_ids ?? []).map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              if (!tag) return null;
              return (
                <button key={tagId} onClick={() => toggleTag(tagId)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {tag.name_display} ×
                </button>
              );
            })}
          </div>
        )}
        <input
          type="text" value={tagQuery} onChange={e => setTagQuery(e.target.value)}
          placeholder="Search tags…"
          style={{ width: '100%', background: 'var(--bg-raised)', border: '1px solid var(--border-default)', borderRadius: '5px', padding: '5px 8px', fontSize: '12px', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', marginBottom: '6px' }}
          onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
        />
        <div style={{ maxHeight: '140px', overflowY: 'auto', paddingRight: '4px' }}>
          {tags.length === 0 && <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>No tags yet</p>}
          {filteredTags.length === 0 && tags.length > 0 && <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>No matching tags</p>}
          {filteredTags.map(tag => {
            const isActive = filters.tag_ids?.includes(tag.id) ?? false;
            return (
              <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '3px 0', cursor: 'pointer', opacity: isActive ? 0.5 : 1 }}>
                <input type="checkbox" checked={isActive} onChange={() => toggleTag(tag.id)} style={{ accentColor: 'var(--color-accent)', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: 'var(--text-primary)', flex: 1 }}>{tag.name_display}</span>
                {tag.asset_count > 0 && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', paddingRight: '2px' }}>{tag.asset_count}</span>}
              </label>
            );
          })}
        </div>
      </Section>

      {/* Drive */}
      {drives.length > 0 && (
        <Section id="drive" label="Drive" open={open.drive} onToggle={() => toggle('drive')}>
          {drives.map(drive => (
            <FilterCheckbox
              key={drive.id}
              label={drive.friendly_name}
              checked={filters.drive_ids?.includes(drive.id) ?? false}
              onChange={() => toggleDrive(drive.id)}
              count={counts?.by_drive[drive.id]}
            />
          ))}
        </Section>
      )}

    </div>
  );
}

function Section({ label, open, onToggle, children }: {
  id: string; label: string; open: boolean;
  onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: open ? '12px' : 0, marginBottom: '12px' }}>
      <button onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 8px', gap: '6px' }}>
        <span style={{ fontSize: '10px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <ChevronDown size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }} />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange, count }: {
  label: string; checked: boolean; count?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', padding: '3px 0' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: 'var(--color-accent)' }} />
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
      {count !== undefined && count > 0 && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{count}</span>}
    </label>
  );
}

function FilterRadio({ label, checked, onChange, name, count }: {
  label: string; checked: boolean; onChange: () => void; name: string; count?: number;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', padding: '3px 0' }}>
      <input type="radio" name={name} checked={checked} onChange={onChange} style={{ accentColor: 'var(--color-accent)' }} />
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
      {count !== undefined && count > 0 && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{count}</span>}
    </label>
  );
}
