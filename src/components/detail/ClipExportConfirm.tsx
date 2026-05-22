// Lossless clip export confirmation panel.

import { Button } from '../common/Button';
import { Dialog, DialogTitle, DialogActions } from '../common/Dialog';
import { formatDuration, formatFileSize } from '../../utils/formatters';
import type { AssetMarker } from '../../types/asset';

interface ClipExportConfirmProps {
  marker: AssetMarker;
  assetDurationMs: number;
  assetFileSizeBytes: number;
  fileExtension: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ClipExportConfirm({
  marker, assetDurationMs, assetFileSizeBytes, fileExtension, onConfirm, onCancel,
}: ClipExportConfirmProps) {
  const clipDurationMs = marker.end_position_ms! - marker.position_ms;
  const ratio = assetDurationMs > 0 ? clipDurationMs / assetDurationMs : 0;
  const estimatedBytes = Math.round(assetFileSizeBytes * ratio);
  const ext = fileExtension.toLowerCase();

  return (
    <Dialog width="360px">
      <DialogTitle>Lossless Clip Export</DialogTitle>
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
        Stream copy — no transcoding, no quality loss
      </p>

      <div style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        overflow: 'hidden',
        marginBottom: '4px',
      }}>
        <ExportRow label="Name"     value={marker.name} />
        <ExportRow label="Duration" value={formatDuration(clipDurationMs)} mono />
        <ExportRow label="Est. size" value={formatFileSize(estimatedBytes)} />
        <ExportRow label="Format"   value={`.${ext} (stream copy)`} last />
      </div>

      <DialogActions>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm}>Choose Location…</Button>
      </DialogActions>
    </Dialog>
  );
}

function ExportRow({ label, value, mono, last }: {
  label: string; value: string; mono?: boolean; last?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 12px',
      borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{
        fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500,
        fontFamily: mono ? 'var(--font-mono)' : undefined,
      }}>
        {value}
      </span>
    </div>
  );
}
