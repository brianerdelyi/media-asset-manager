// Full asset detail view — opened when clicking an asset card.

import { useState, useRef } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { VideoPlayer, VideoPlayerHandle } from './VideoPlayer';
import { MarkerPanel } from './MarkerPanel';
import { ClipExportConfirm } from './ClipExportConfirm';
import { DriveStatusBadge } from '../drives/DriveStatusBadge';
import { Button } from '../common/Button';
import { formatDate, formatDuration, formatFileSize, formatResolution, mediaTypeIcon } from '../../utils/formatters';
import { openAsset, revealAsset } from '../../commands/assets';
import { deleteMarker, updateMarker } from '../../commands/markers';
import { useLibraryStore } from '../../stores/libraryStore';
import type { AssetDetail, AssetMarker } from '../../types/asset';

interface AssetDetailViewProps {
  asset: AssetDetail;
  onClose: () => void;
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1v6.5M6 7.5L3.5 5M6 7.5L8.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="2" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AssetDetailView({ asset, onClose }: AssetDetailViewProps) {
  const [currentMs, setCurrentMs] = useState(0);
  const [minScrubMs, setMinScrubMs] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [exportTarget, setExportTarget] = useState<AssetMarker | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const videoRef = useRef<VideoPlayerHandle>(null);
  const { refreshSelected } = useLibraryStore();

  const onlineLoc = asset.locations.find(l => l.is_online && !l.is_missing);
  const thumbUrl = asset.thumbnail_path ? convertFileSrc(asset.thumbnail_path) : null;

  async function handleOpen() {
    if (!onlineLoc) return;
    try { await openAsset(asset.id, onlineLoc.id); } catch (e) { console.error(e); }
  }

  async function handleReveal() {
    if (!onlineLoc) return;
    try { await revealAsset(asset.id, onlineLoc.id); } catch (e) { console.error(e); }
  }

  function handleMarkerClick(positionMs: number) {
    videoRef.current?.seekTo(positionMs);
  }

  function startEditingMarker(marker: AssetMarker) {
    setEditingMarkerId(marker.id);
    setEditingName(marker.name);
    setConfirmDeleteId(null);
  }

  async function saveMarkerName(markerId: string) {
    const name = editingName.trim();
    if (name) {
      try {
        await updateMarker(markerId, { name });
        refreshSelected();
      } catch (e) {
        console.error('Failed to rename marker:', e);
      }
    }
    setEditingMarkerId(null);
    setEditingName('');
  }

  async function handleDeleteConfirm(markerId: string) {
    try {
      await deleteMarker(markerId);
      refreshSelected();
    } catch (e) {
      console.error('Failed to delete marker:', e);
    } finally {
      setConfirmDeleteId(null);
    }
  }

  async function handleExportConfirmed() {
    if (!exportTarget) return;
    const marker = exportTarget;
    setExportTarget(null);

    const ext = asset.file_extension.toLowerCase();
    const suggestedName = `${marker.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`;

    const outputPath = await save({
      title: 'Lossless Clip Export',
      defaultPath: suggestedName,
      filters: [{ name: `Video (.${ext})`, extensions: [ext] }],
    });

    if (!outputPath) return;

    setExportingId(marker.id);
    setExportError(null);

    try {
      await invoke('clip_export', {
        assetId: asset.id,
        markerId: marker.id,
        outputPath,
      });
    } catch (e) {
      setExportError(String(e));
    } finally {
      setExportingId(null);
    }
  }

  return (
    <div className="flex h-full overflow-hidden bg-gray-950">
      {exportTarget && (
        <ClipExportConfirm
          marker={exportTarget}
          assetDurationMs={asset.duration_ms ?? 0}
          assetFileSizeBytes={asset.file_size}
          fileExtension={asset.file_extension}
          onConfirm={handleExportConfirmed}
          onCancel={() => setExportTarget(null)}
        />
      )}

      {/* Left — video/preview + marker creation */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-sm transition-colors flex-shrink-0">
            ← Back
          </button>
          <h1 className="text-sm font-medium text-white truncate flex-1">
            {asset.locations[0]?.filename ?? 'Asset Detail'}
          </h1>
          {onlineLoc && (
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="primary" onClick={handleOpen} className="text-xs">Open</Button>
              <Button variant="secondary" onClick={handleReveal} className="text-xs">Show in Finder</Button>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {asset.media_type === 'video' && onlineLoc ? (
            <VideoPlayer
              ref={videoRef}
              filePath={onlineLoc.file_path}
              durationMs={asset.duration_ms ?? 0}
              markers={asset.markers}
              minScrubMs={minScrubMs}
              onTimeUpdate={setCurrentMs}
              onMarkerClick={handleMarkerClick}
            />
          ) : (
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
              {thumbUrl ? (
                <img src={thumbUrl} alt="preview" className="w-full h-full object-contain" />
              ) : (
                <span className="text-6xl opacity-20">{mediaTypeIcon(asset.media_type)}</span>
              )}
            </div>
          )}
        </div>

        {asset.media_type === 'video' && (
          <div className="flex-shrink-0">
            <MarkerPanel
              assetId={asset.id}
              markers={asset.markers}
              currentMs={currentMs}
              onMarkersChanged={refreshSelected}
              onMarkerClick={handleMarkerClick}
              onConstrainScrub={setMinScrubMs}
            />
          </div>
        )}
      </div>

      {/* Right — metadata + marker list */}
      <div className="w-64 flex-shrink-0 border-l border-gray-800 overflow-y-auto p-4 space-y-5">
        {thumbUrl && (
          <div className="aspect-video bg-gray-800 rounded overflow-hidden">
            <img src={thumbUrl} alt="thumbnail" className="w-full h-full object-cover" />
          </div>
        )}

        {asset.is_orphaned && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded p-2 text-xs text-yellow-300">
            No active drive location
          </div>
        )}

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
                  {loc.is_missing && <span className="text-xs text-red-400">Missing</span>}
                </div>
                <p className="text-xs text-gray-600 break-all">{loc.file_path}</p>
              </div>
            ))}
          </div>
        </div>

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

        {asset.markers.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Markers ({asset.markers.length})
            </p>

            {exportError && (
              <div className="bg-red-900/30 border border-red-700/50 rounded p-2 mb-2 text-xs text-red-400">
                {exportError}
              </div>
            )}

            <div className="space-y-1">
              {asset.markers.map(marker => {
                const isRange = marker.end_position_ms && marker.end_position_ms > marker.position_ms;
                const isExporting = exportingId === marker.id;
                const isEditing = editingMarkerId === marker.id;

                return (
                  <div key={marker.id} className="bg-gray-800 rounded px-2 py-1.5 group">
                    <div className="flex items-center justify-between gap-1">
                      {/* Name — inline edit or display */}
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveMarkerName(marker.id);
                            if (e.key === 'Escape') { setEditingMarkerId(null); setEditingName(''); }
                          }}
                          onBlur={() => saveMarkerName(marker.id)}
                          autoFocus
                          className="flex-1 bg-gray-700 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-gray-200 focus:outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => handleMarkerClick(marker.position_ms)}
                          className="flex items-center gap-2 flex-1 min-w-0 text-left"
                        >
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-400" />
                          <span className="text-xs text-gray-300 truncate">{marker.name}</span>
                        </button>
                      )}

                      {/* Action icons — visible on hover */}
                      {!isEditing && (
                        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit name */}
                          <button
                            onClick={() => startEditingMarker(marker)}
                            title="Rename marker"
                            className="text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            <PencilIcon />
                          </button>

                          {/* Export clip */}
                          {isRange && onlineLoc && (
                            <button
                              onClick={() => setExportTarget(marker)}
                              disabled={isExporting}
                              title="Lossless clip export"
                              className="text-gray-500 hover:text-blue-400 disabled:opacity-30 transition-colors"
                            >
                              {isExporting ? <span className="text-xs">…</span> : <DownloadIcon />}
                            </button>
                          )}

                          {/* Delete */}
                          {confirmDeleteId === marker.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDeleteConfirm(marker.id)} className="text-xs text-red-400 hover:text-red-300 font-medium">Yes</button>
                              <span className="text-gray-600 text-xs">/</span>
                              <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-gray-500 hover:text-gray-300">No</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(marker.id)}
                              title="Delete marker"
                              className="text-gray-500 hover:text-red-400 transition-colors text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="mt-0.5 ml-4 text-xs text-gray-600 font-mono">
                      {formatDuration(marker.position_ms)}
                      {isRange && ` → ${formatDuration(marker.end_position_ms!)}`}
                    </div>
                  </div>
                );
              })}
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
