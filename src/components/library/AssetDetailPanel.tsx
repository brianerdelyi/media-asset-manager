// Asset detail panel — shown when an asset is selected.

import { openAsset, revealAsset } from '../../commands/assets';
import { DriveStatusBadge } from '../drives/DriveStatusBadge';
import { Button } from '../common/Button';
import { formatDate, formatDuration, formatFileSize, formatResolution, mediaTypeIcon } from '../../utils/formatters';
import type { AssetDetail } from '../../types/asset';

interface AssetDetailPanelProps {
  asset: AssetDetail;
  onClose: () => void;
}

export function AssetDetailPanel({ asset, onClose }: AssetDetailPanelProps) {
  const onlineLoc = asset.locations.find(l => l.is_online && !l.is_missing);

  async function handleOpen() {
    if (!onlineLoc) return;
    try { await openAsset(asset.id, onlineLoc.id); } catch (e) { console.error(e); }
  }

  async function handleReveal() {
    if (!onlineLoc) return;
    try { await revealAsset(asset.id, onlineLoc.id); } catch (e) { console.error(e); }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-white truncate">
          {asset.locations[0]?.filename ?? 'Asset Detail'}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
          {asset.thumbnail_path ? (
            <img
              src={`asset://${asset.thumbnail_path}`}
              alt="thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl opacity-30">{mediaTypeIcon(asset.media_type)}</span>
          )}
        </div>

        {/* Actions */}
        {onlineLoc && (
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleOpen} className="flex-1 text-xs">
              Open
            </Button>
            <Button variant="secondary" onClick={handleReveal} className="flex-1 text-xs">
              Show in Finder
            </Button>
          </div>
        )}

        {/* Orphaned warning */}
        {asset.is_orphaned && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded p-2 text-xs text-yellow-300">
            This asset has no active drive location.
          </div>
        )}

        {/* Metadata */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Metadata</p>
          <div className="space-y-1.5">
            <MetaRow label="Type" value={`${asset.media_type} / .${asset.file_extension}`} />
            <MetaRow label="Size" value={formatFileSize(asset.file_size)} />
            {asset.duration_ms && <MetaRow label="Duration" value={formatDuration(asset.duration_ms)} />}
            {(asset.width || asset.height) && <MetaRow label="Resolution" value={formatResolution(asset.width, asset.height)} />}
            {asset.codec && <MetaRow label="Codec" value={asset.codec} />}
            {asset.frame_rate && <MetaRow label="Frame Rate" value={`${asset.frame_rate} fps`} />}
            {asset.sample_rate && <MetaRow label="Sample Rate" value={`${asset.sample_rate} Hz`} />}
            <MetaRow label="Created" value={formatDate(asset.created_at_fs)} />
            <MetaRow label="Modified" value={formatDate(asset.modified_at_fs)} />
          </div>
        </div>

        {/* Locations */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Locations ({asset.locations.length})
          </p>
          <div className="space-y-2">
            {asset.locations.map(loc => (
              <div key={loc.id} className="bg-gray-800 rounded p-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-300 font-medium">{loc.drive_name}</span>
                  <DriveStatusBadge isOnline={loc.is_online} />
                  {loc.is_missing && (
                    <span className="text-xs text-red-400">Missing</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 break-all">{loc.file_path}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        {asset.tags.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Tags</p>
            <div className="flex flex-wrap gap-1">
              {asset.tags.map(tag => (
                <span key={tag.id} className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                  {tag.name_display}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Markers */}
        {asset.markers.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Markers ({asset.markers.length})
            </p>
            <div className="space-y-1">
              {asset.markers.map(marker => (
                <div key={marker.id} className="bg-gray-800 rounded p-2 flex items-center justify-between">
                  <span className="text-xs text-gray-300">{marker.name}</span>
                  <span className="text-xs text-gray-600">
                    {formatDuration(marker.position_ms)}
                    {marker.end_position_ms && ` → ${formatDuration(marker.end_position_ms)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-300 text-right truncate">{value}</span>
    </div>
  );
}
