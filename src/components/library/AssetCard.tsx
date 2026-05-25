// Asset card — thumbnail scales with cardSize (120–300px).
// Font sizes are fixed — same as every professional media app (Lightroom, Bridge, Photos).
// Secondary metadata hidden below 160px where there isn't enough room.

import { useState, useEffect } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { Film, Image, Music } from 'lucide-react';
import type { AssetSummary } from '../../types/asset';
import { CARD_SIZE_MIN, CARD_SIZE_MAX } from '../../stores/themeStore';
import { formatDuration, formatResolution } from '../../utils/formatters';
import { useLibraryStore } from '../../stores/libraryStore';

interface AssetCardProps {
  asset: AssetSummary;
  cardSize: number;
  isSelected: boolean;
  onClick: () => void;
}

function MediaIcon({ type, size }: { type: string; size: number }) {
  const style = { opacity: 0.3, color: 'var(--text-secondary)' };
  if (type === 'video') return <Film size={size} style={style} />;
  if (type === 'image') return <Image size={size} style={style} />;
  return <Music size={size} style={style} />;
}

export function AssetCard({ asset, cardSize, isSelected, onClick }: AssetCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const assetNames = useLibraryStore(s => s.assetNames);

  useEffect(() => {
    if (asset.thumbnail_path) setThumbUrl(convertFileSrc(asset.thumbnail_path));
  }, [asset.thumbnail_path]);

  const defaultName = asset.filename.replace(/\.[^.]+$/, '');
  const displayName = assetNames[asset.id] ?? defaultName;

  // Only hide secondary meta on very small cards — not enough room
  const showMeta = cardSize >= 160;

  // Placeholder icon scales with card — only visible thing that changes besides thumbnail
  const iconSize = Math.round(16 + ((cardSize - CARD_SIZE_MIN) / (CARD_SIZE_MAX - CARD_SIZE_MIN)) * 24);

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer', borderRadius: '8px',
        border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--border-default)',
        background: isSelected ? 'var(--color-accent-subtle)' : 'var(--bg-surface)',
        transition: 'border-color 0.12s, background 0.12s',
        overflow: 'hidden', minWidth: 0,
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)'; }}
    >
      {/* Thumbnail — always 16:9, fills the card width */}
      <div style={{
        width: '100%', aspectRatio: '16/9',
        background: 'var(--bg-raised)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {thumbUrl ? (
          <img src={thumbUrl} alt={displayName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setThumbUrl(null)} />
        ) : (
          <MediaIcon type={asset.media_type} size={iconSize} />
        )}

        {/* Duration badge — fixed font size */}
        {asset.duration_ms && asset.media_type === 'video' && (
          <div style={{
            position: 'absolute', bottom: '4px', right: '4px',
            background: 'rgba(0,0,0,0.72)', color: '#fff',
            fontSize: '10px', padding: '1px 5px',
            borderRadius: '3px', fontFamily: 'var(--font-mono)',
          }}>
            {formatDuration(asset.duration_ms)}
          </div>
        )}

        {asset.is_orphaned && (
          <div style={{
            position: 'absolute', top: '4px', left: '4px',
            background: 'rgba(255,159,10,0.85)', color: '#fff',
            fontSize: '10px', padding: '1px 5px', borderRadius: '3px',
          }}>
            Orphaned
          </div>
        )}

        {asset.marker_count > 0 && (
          <div style={{
            position: 'absolute', top: '4px', right: '4px',
            background: 'rgba(10,132,255,0.85)', color: '#fff',
            fontSize: '10px', padding: '1px 5px', borderRadius: '3px',
          }}>
            {asset.marker_count} ★
          </div>
        )}
      </div>

      {/* Info — fixed font sizes, same as Lightroom/Bridge/Photos */}
      <div style={{ padding: '6px 8px' }}>
        <p style={{
          fontSize: '12px', fontWeight: 500,
          color: 'var(--text-primary)', margin: '0 0 2px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }} title={displayName}>
          {displayName}
        </p>

        {showMeta && (
          <p style={{
            fontSize: '11px', color: 'var(--text-secondary)',
            margin: '0 0 3px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {[formatResolution(asset.width, asset.height), asset.codec?.toUpperCase() ?? null]
              .filter(Boolean).join(' · ')}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
          <span style={{
            flexShrink: 0, width: '6px', height: '6px', borderRadius: '50%',
            background: asset.is_orphaned
              ? 'var(--status-orphaned)'
              : asset.primary_drive_online
              ? 'var(--status-online)'
              : 'var(--status-offline)',
          }} />
          <span style={{
            fontSize: '11px', color: 'var(--text-tertiary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }} title={asset.primary_drive_name ?? ''}>
            {asset.primary_drive_name ?? 'No drive'}
          </span>
        </div>
      </div>
    </div>
  );
}
