// Filter panel — media type, drive, status filters.

import { useDriveStore } from '../../stores/driveStore';
import type { AssetSearchFilters } from '../../types/asset';

interface FilterPanelProps {
  filters: AssetSearchFilters;
  onChange: (filters: Partial<AssetSearchFilters>) => void;
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const { drives } = useDriveStore();

  function toggleMediaType(type: string) {
    const current = filters.media_types ?? [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onChange({ media_types: updated.length > 0 ? updated : undefined });
  }

  function toggleDrive(driveId: string) {
    const current = filters.drive_ids ?? [];
    const updated = current.includes(driveId)
      ? current.filter(d => d !== driveId)
      : [...current, driveId];
    onChange({ drive_ids: updated.length > 0 ? updated : undefined });
  }

  const hasActiveFilters = filters.media_types || filters.drive_ids || filters.status || filters.has_markers;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Type */}
      <FilterSection label="Type">
        {['video', 'image', 'audio'].map(type => (
          <FilterCheckbox
            key={type}
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            checked={filters.media_types?.includes(type) ?? false}
            onChange={() => toggleMediaType(type)}
          />
        ))}
      </FilterSection>

      {/* Status */}
      <FilterSection label="Status">
        {[
          { value: 'all', label: 'All' },
          { value: 'orphaned', label: 'Orphaned' },
          { value: 'missing', label: 'Missing' },
        ].map(opt => (
          <FilterRadio
            key={opt.value}
            label={opt.label}
            checked={(filters.status ?? 'all') === opt.value}
            onChange={() => onChange({ status: opt.value as any })}
            name="status"
          />
        ))}
      </FilterSection>

      {/* Markers */}
      <FilterSection label="Markers">
        <FilterCheckbox
          label="Has markers"
          checked={filters.has_markers ?? false}
          onChange={e => onChange({ has_markers: e.target.checked ? true : undefined })}
        />
      </FilterSection>

      {/* Drives */}
      {drives.length > 0 && (
        <FilterSection label="Drive">
          {drives.map(drive => (
            <FilterCheckbox
              key={drive.id}
              label={drive.friendly_name}
              checked={filters.drive_ids?.includes(drive.id) ?? false}
              onChange={() => toggleDrive(drive.id)}
            />
          ))}
        </FilterSection>
      )}

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ media_types: undefined, drive_ids: undefined, status: 'all', has_markers: undefined })}
          style={{
            fontSize: '12px', color: 'var(--color-accent)',
            background: 'none', border: 'none', cursor: 'pointer',
            textAlign: 'left', padding: 0,
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{
        fontSize: '10px', color: 'var(--text-tertiary)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        margin: '0 0 6px',
      }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {children}
      </div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: 'var(--color-accent)' }} />
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
    </label>
  );
}

function FilterRadio({ label, checked, onChange, name }: {
  label: string;
  checked: boolean;
  onChange: () => void;
  name: string;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}>
      <input type="radio" name={name} checked={checked} onChange={onChange} style={{ accentColor: 'var(--color-accent)' }} />
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
    </label>
  );
}
