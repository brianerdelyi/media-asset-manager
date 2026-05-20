// Filter panel — media type, drive, status, date range filters.

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

  const mediaTypes = ['video', 'image', 'audio'];
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'orphaned', label: 'Orphaned' },
    { value: 'missing', label: 'Missing' },
  ];

  return (
    <div className="space-y-4">
      {/* Media Type */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Type</p>
        <div className="space-y-1">
          {mediaTypes.map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.media_types?.includes(type) ?? false}
                onChange={() => toggleMediaType(type)}
                className="rounded"
              />
              <span className="text-sm text-gray-300 capitalize group-hover:text-white">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Status</p>
        <div className="space-y-1">
          {statusOptions.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="status"
                value={opt.value}
                checked={(filters.status ?? 'all') === opt.value}
                onChange={() => onChange({ status: opt.value as any })}
              />
              <span className="text-sm text-gray-300 group-hover:text-white">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Has Markers */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.has_markers ?? false}
            onChange={e => onChange({ has_markers: e.target.checked ? true : undefined })}
            className="rounded"
          />
          <span className="text-sm text-gray-300 group-hover:text-white">Has markers</span>
        </label>
      </div>

      {/* Source Drive */}
      {drives.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Drive</p>
          <div className="space-y-1">
            {drives.map(drive => (
              <label key={drive.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.drive_ids?.includes(drive.id) ?? false}
                  onChange={() => toggleDrive(drive.id)}
                  className="rounded"
                />
                <span className="text-sm text-gray-300 truncate group-hover:text-white" title={drive.friendly_name}>
                  {drive.friendly_name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Clear filters */}
      {(filters.media_types || filters.drive_ids || filters.status || filters.has_markers) && (
        <button
          onClick={() => onChange({ media_types: undefined, drive_ids: undefined, status: 'all', has_markers: undefined })}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
