// Marker panel — Add Marker button and creation form only.
// The marker list is displayed in the right detail panel (AssetDetailView).

import { useState } from 'react';
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
}

export function MarkerPanel({
  assetId,
  markers,
  currentMs,
  onMarkersChanged,
  onConstrainScrub,
}: MarkerPanelProps) {
  const [active, setActive] = useState(false);
  const [inMs, setInMs] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const nextMarkerNum = markers.length + 1;

  function handleAddMarker() {
    setInMs(currentMs);
    setName(`Marker ${nextMarkerNum}`);
    setActive(true);
    onConstrainScrub?.(currentMs);
  }

  async function handleSave() {
    if (inMs === null) return;
    setSaving(true);
    const outMs = currentMs > inMs ? currentMs : inMs;
    try {
      await createMarker({
        asset_id: assetId,
        name: name.trim() || `Marker ${nextMarkerNum}`,
        marker_type: outMs > inMs ? 'clip' : 'point',
        position_ms: inMs,
        end_position_ms: outMs > inMs ? outMs : undefined,
      });
      onMarkersChanged();
    } catch (e) {
      console.error('Failed to save marker:', e);
    } finally {
      setSaving(false);
      setActive(false);
      setInMs(null);
      setName('');
      onConstrainScrub?.(null);
    }
  }

  function handleCancel() {
    setActive(false);
    setInMs(null);
    setName('');
    onConstrainScrub?.(null);
  }

  const outMs = active && inMs !== null ? Math.max(currentMs, inMs) : null;

  if (!active) {
    return (
      <Button variant="secondary" onClick={handleAddMarker} className="text-xs">
        + Add Marker
      </Button>
    );
  }

  return (
    <div className="bg-gray-800 border border-blue-700/50 rounded p-3 space-y-2">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
        placeholder="Marker name..."
        autoFocus
        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-200
                   placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      <div className="flex items-center gap-4 text-xs">
        <div>
          <span className="text-gray-500 mr-1.5">In</span>
          <span className="text-blue-400 font-mono">{formatDuration(inMs!)}</span>
        </div>
        <div>
          <span className="text-gray-500 mr-1.5">Out</span>
          <span className={`font-mono ${outMs !== null && outMs > inMs! ? 'text-orange-400' : 'text-gray-600'}`}>
            {outMs !== null && outMs > inMs! ? formatDuration(outMs) : '——'}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" onClick={handleSave} disabled={saving} className="text-xs flex-1">
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button variant="secondary" onClick={handleCancel} disabled={saving} className="text-xs">
          Cancel
        </Button>
      </div>
    </div>
  );
}
