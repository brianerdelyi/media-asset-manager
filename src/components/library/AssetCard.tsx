// Asset card — fixed size, shown in the library grid view.

import type { AssetSummary } from '../../types/asset';
import { formatDuration, formatResolution, mediaTypeIcon } from '../../utils/formatters';

interface AssetCardProps {
  asset: AssetSummary;
  isSelected: boolean;
  onClick: () => void;
}

export function AssetCard({ asset, isSelected, onClick }: AssetCardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border transition-colors flex-shrink-0 w-44 ${
        isSelected
          ? 'border-blue-500 bg-blue-950/30'
          : 'border-gray-800 bg-gray-900 hover:border-gray-600'
      }`}
    >
      {/* Thumbnail — fixed aspect ratio */}
      <div className="w-full aspect-video bg-gray-800 rounded-t-lg flex items-center justify-center relative overflow-hidden">
        {asset.thumbnail_path ? (
          <img
            src={`asset://${asset.thumbnail_path}`}
            alt={asset.filename}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span className="text-3xl opacity-40">{mediaTypeIcon(asset.media_type)}</span>
        )}

        {/* Duration overlay — bottom right */}
        {asset.duration_ms && asset.media_type === 'video' && (
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
            {formatDuration(asset.duration_ms)}
          </div>
        )}

        {/* Orphaned badge */}
        {asset.is_orphaned && (
          <div className="absolute top-1 left-1 bg-yellow-900/80 text-yellow-300 text-xs px-1.5 py-0.5 rounded">
            Orphaned
          </div>
        )}

        {/* Marker count badge */}
        {asset.marker_count > 0 && (
          <div className="absolute top-1 right-1 bg-blue-900/80 text-blue-300 text-xs px-1.5 py-0.5 rounded">
            {asset.marker_count} ★
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-2 space-y-0.5">
        {/* Line 1: filename */}
        <p className="text-xs text-gray-200 font-medium truncate" title={asset.filename}>
          {asset.filename}
        </p>

        {/* Line 2: resolution + codec */}
        <p className="text-xs text-gray-500 truncate">
          {[
            formatResolution(asset.width, asset.height),
            asset.codec?.toUpperCase() ?? null,
          ].filter(Boolean).join(' · ')}
        </p>

        {/* Line 3: drive name + online status dot */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${
              asset.is_orphaned
                ? 'bg-yellow-500'
                : asset.primary_drive_online
                ? 'bg-green-500'
                : 'bg-gray-600'
            }`}
          />
          <span className="text-xs text-gray-500 truncate" title={asset.primary_drive_name ?? ''}>
            {asset.primary_drive_name ?? 'No drive'}
          </span>
        </div>
      </div>
    </div>
  );
}
