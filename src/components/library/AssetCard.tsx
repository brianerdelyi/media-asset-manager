// Asset card — responsive to card size (S/M/L) set by the user.
// The grid uses minmax so cards stretch to fill the row evenly.
// Last row cards stay at natural width and left-align.

import { useState, useEffect } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { Film, Image, Music } from 'lucide-react';
import type { AssetSummary } from '../../types/asset';
import type { CardSize } from '../../stores/themeStore';
import { formatDuration, formatResolution } from '../../utils/formatters';
import { useLibraryStore } from '../../stores/libraryStore';

interface AssetCardProps {
  asset: AssetSummary;
  cardSize: CardSize;
  isSelected: boolean;
  onClick: () => void;
}

function MediaIcon({ type, size }: { type: string; size: number }) {
  const style = { opacity: 0.3, color: 'var(--text-secondary)' };
  if (type === 'video') return <Film size={size} style={style} />;
  if (type === 'image') return <Image size={size} style={style} />;
  return <Music size={size} style={style} />;
}

// Scale typography and badge sizes with card size
const CARD_STYLES: Record<CardSize, {
  nameFontSize: number;
  metaFontSize: number;
  badgeFontSize: number;
  iconSize: number;
  padding: string;
  infoPadding: string;
}> = {
  S: { nameFontSize: 11, metaFontSize: 10, badgeFontSize: 9,  iconSize: 20, padding: '6px 8px',  infoPadding: '5px 7px'  },
  M: { nameFontSize: 12, metaFontSize: 11, badgeFontSize: 10, iconSize: 28, padding: '8px 10px', infoPadding: '7px 9px'  },
  L: { nameFontSize: 13, metaFontSize: 12, badgeFontSize: 10, iconSize: 36, padding: '8px 10px', infoPadding: '9px 11px' },
};

export function AssetCard({ asset, cardSize, isSelected, onClick }: AssetCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const assetNames = useLibraryStore(s => s.assetNames);
  const styles = CARD_STYLES[cardSize];

  useEffect(() => {
    if (asset.thumbnail_path) setThumbUrl(convertFileSrc(asset.thumbnail_path));
  }, [asset.thumbnail_path]);

  const defaultName = asset.filename.replace(/\.[^.]+$/, '');
  const displayName = assetNames[asset.id] ?? defaultName;

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer', borderRadius: '8px',
        border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--border-default)',
        background: isSelected ? 'var(--color-accent-subtle)' : 'var(--bg-surface)',
        transition: 'border-color 0.12s, background 0.12s',
        overflow: 'hidden',
        // min-width: 0 ensures the card can shrink inside the grid cell
        minWidth: 0,
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)'; }}
    >
      {/* Thumbnail — always 16:9 */}
      <div style={{
        width: '100%', aspectRatio: '16/9',
        background: 'var(--bg-raised)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {thumbUrl ? (
          <img
            src={thumbUrl} alt={displayName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setThumbUrl(null)}
          />
        ) : (
          <MediaIcon type={asset.media_type} size={styles.iconSize} />
        )}

        {/* Duration badge */}
        {asset.duration_ms && asset.media_type === 'video' && (
          <div style={{
            position: 'absolute', bottom: '4px', right: '4px',
            background: 'rgba(0,0,0,0.72)', color: '#fff',
            fontSize: `${styles.badgeFontSize}px`, padding: '1px 5px',
            borderRadius: '3px', fontFamily: 'var(--font-mono)',
          }}>
            {formatDuration(asset.duration_ms)}
          </div>
        )}

        {/* Orphaned badge */}
        {asset.is_orphaned && (
          <div style={{
            position: 'absolute', top: '4px', left: '4px',
            background: 'rgba(255,159,10,0.85)', color: '#fff',
            fontSize: `${styles.badgeFontSize}px`, padding: '1px 5px', borderRadius: '3px',
          }}>
            Orphaned
          </div>
        )}

        {/* Marker count badge */}
        {asset.marker_count > 0 && (
          <div style={{
            position: 'absolute', top: '4px', right: '4px',
            background: 'rgba(10,132,255,0.85)', color: '#fff',
            fontSize: `${styles.badgeFontSize}px`, padding: '1px 5px', borderRadius: '3px',
          }}>
            {asset.marker_count} ★
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: styles.infoPadding }}>
        <p style={{
          fontSize: `${styles.nameFontSize}px`, fontWeight: 500,
          color: 'var(--text-primary)', margin: '0 0 2px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }} title={displayName}>
          {displayName}
        </p>

        {/* Hide secondary meta on S cards — not enough space */}
        {cardSize !== 'S' && (
          <p style={{
            fontSize: `${styles.metaFontSize}px`, color: 'var(--text-secondary)',
            margin: '0 0 3px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {[formatResolution(asset.width, asset.height), asset.codec?.toUpperCase() ?? null].filter(Boolean).join(' · ')}
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
            fontSize: `${styles.metaFontSize}px`, color: 'var(--text-tertiary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }} title={asset.primary_drive_name ?? ''}>
            {asset.primary_drive_name ?? 'No drive'}
          </span>
        </div>
      </div>
    </div>
  );
}
