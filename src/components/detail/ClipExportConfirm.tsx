// Lossless clip export confirmation panel.

import { Button } from '../common/Button';
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
  marker,
  assetDurationMs,
  assetFileSizeBytes,
  fileExtension,
  onConfirm,
  onCancel,
}: ClipExportConfirmProps) {
  const clipDurationMs = marker.end_position_ms! - marker.position_ms;
  const ratio = assetDurationMs > 0 ? clipDurationMs / assetDurationMs : 0;
  const estimatedBytes = Math.round(assetFileSizeBytes * ratio);
  const ext = fileExtension.toLowerCase();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 w-80 shadow-xl">
        <h2 className="text-sm font-semibold text-white mb-1">Lossless Clip Export</h2>
        <p className="text-xs text-gray-500 mb-4">Stream copy — no transcoding, no quality loss</p>

        <div className="bg-gray-800 rounded p-3 mb-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Name</span>
            <span className="text-gray-300">{marker.name}</span>
          </div>
          <div className="flex justify-between text-xs border-t border-gray-700 pt-2">
            <span className="text-gray-500">Duration</span>
            <span className="text-white font-mono font-medium">{formatDuration(clipDurationMs)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Est. size</span>
            <span className="text-white font-medium">{formatFileSize(estimatedBytes)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Format</span>
            <span className="text-gray-300">.{ext} (stream copy)</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel} className="flex-1 text-xs">Cancel</Button>
          <Button variant="primary" onClick={onConfirm} className="flex-1 text-xs">Choose Location…</Button>
        </div>
      </div>
    </div>
  );
}
