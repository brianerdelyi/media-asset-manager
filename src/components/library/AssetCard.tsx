// Asset card — fixed size, shown in the library grid view.

import { useState, useEffect } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { Film, Image, Music } from 'lucide-react';
import type { AssetSummary } from '../../types/asset';
import { formatDuration, formatResolution } from '../../utils/formatters';
import { useLibraryStore } from '../../stores/libraryStore';

interface AssetCardProps {
  asset: AssetSummary;
  isSelected: boolean;
  onClick: () => void;
}

function MediaIcon({ type }: { type: string }) {
  const style = { opacity: 0.3, color: 'var(--text-secondary)' };
  if (type === 'video') return <Film size={28} style={style} />;
  if (type === 'image') return <Image size={28} style={style} />;
  return <Music size={28} style={style} />;
}

export function AssetCard({ asset, isSelected, onClick }: AssetCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const assetNames = useLibraryStore(s => s.assetNames);

  useEffect(() => {
    if (asset.thumbnail_path) setThumbUrl(convertFileSrc(asset.thumbnail_path));
  }, [asset.thumbnail_path]);

  // Use custom asset name if set, otherwise fall back to filename without extension
  const defaultName = asset.filename.replace(/\.[^.]+$/, '');
  const displayName = assetNames[asset.id] ?? defaultName;

  return (
    <div
      onClick={onClick}
      style={{
        width: '192px', flexShrink: 0, cursor: 'pointer', borderRadius: '8px',
        border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--border-default)',
        background: isSelected ? 'var(--color-accent-subtle)' : 'var(--bg-surface)',
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)'; }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%', aspectRatio: '16/9', background: 'var(--bg-raised)',
        borderRadius: '7px 7px 0 0', display: 'flex', alignItems: 'center',
        justifyContent: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {thumbUrl ? (
          <img src={thumbUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setThumbUrl(null)} />
        ) : (
          <MediaIcon type={asset.media_type} />
        )}

        {/* Duration */}
        {asset.duration_ms && asset.media_type === 'video' && (
          <div style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', padding: '1px 5px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>
            {formatDuration(asset.duration_ms)}
          </div>
        )}

        {/* Orphaned badge */}
        {asset.is_orphaned && (
          <div style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(255,159,10,0.85)', color: '#fff', fontSize: '10px', padding: '1px 5px', borderRadius: '3px' }}>
            Orphaned
          </div>
        )}

        {/* Marker count */}
        {asset.marker_count > 0 && (
          <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(10,132,255,0.85)', color: '#fff', fontSize: '10px', padding: '1px 5px', borderRadius: '3px' }}>
            {asset.marker_count} ★
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '8px 10px' }}>
        {/* Asset name — custom name if set, otherwise filename without extension */}
        <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={displayName}>
          {displayName}
        </p>

        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {[formatResolution(asset.width, asset.height), asset.codec?.toUpperCase() ?? null].filter(Boolean).join(' · ')}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
          <span style={{
            flexShrink: 0, width: '6px', height: '6px', borderRadius: '50%',
            background: asset.is_orphaned ? 'var(--status-orphaned)' : asset.primary_drive_online ? 'var(--status-online)' : 'var(--status-offline)',
          }} />
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={asset.primary_drive_name ?? ''}>
            {asset.primary_drive_name ?? 'No drive'}
          </span>
        </div>
      </div>
    </div>
  );
}
