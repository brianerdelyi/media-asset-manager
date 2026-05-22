// Marker creation form — shown inline in the right panel when Add is clicked.

import { useState, useEffect } from 'react';
import { createMarker } from '../../commands/markers';
import { Button } from '../common/Button';
import { formatDuration } from '../../utils/formatters';
import type { AssetMarker } from '../../types/asset';

interface MarkerPanelProps {
  assetId: string;
  markers: AssetMarker[];
  currentMs: number;
  onMarkersChanged: () => void;
  onMarkerClick: (positionMs: number) => void;
  onConstrainScrub?: (minMs: number | null) => void;
  onCancel?: () => void;
}

export function MarkerPanel({
  assetId,
  markers,
  currentMs,
  onMarkersChanged,
  onConstrainScrub,
  onCancel,
}: MarkerPanelProps) {
  const [inMs] = useState<number>(currentMs);
  const [name, setName] = useState(`Marker ${markers.length + 1}`);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    onConstrainScrub?.(inMs);
    return () => onConstrainScrub?.(null);
  }, []);

  const outMs = currentMs > inMs ? currentMs : null;

  async function handleSave() {
    setSaving(true);
    try {
      await createMarker({
        asset_id: assetId,
        name: name.trim() || `Marker ${markers.length + 1}`,
        marker_type: outMs ? 'clip' : 'point',
        position_ms: inMs,
        end_position_ms: outMs ?? undefined,
      });
      onMarkersChanged();
    } catch (e) {
      console.error('Failed to save marker:', e);
      setSaving(false);
    }
  }

  function handleCancel() {
    onCancel?.();
  }

  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--color-accent)',
      borderRadius: '6px',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
        placeholder="Marker name…"
        autoFocus
        style={{
          width: '100%', background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)', borderRadius: '6px',
          padding: '6px 10px', fontSize: '13px', color: 'var(--text-primary)',
          outline: 'none', boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>In</span>
          <span style={{ fontSize: '11px', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
            {formatDuration(inMs)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Out</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: outMs ? 'var(--status-orphaned)' : 'var(--text-tertiary)' }}>
            {outMs ? formatDuration(outMs) : '——'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
