// Indexing confirmation dialog.
// Shows drive name and thumbnail toggle before starting indexing.

import { useState } from 'react';
import { Button } from '../common/Button';

interface IndexConfirmDialogProps {
  driveName: string;
  defaultGenerateThumbnails: boolean;
  onConfirm: (generateThumbnails: boolean) => void;
  onCancel: () => void;
}

export function IndexConfirmDialog({
  driveName,
  defaultGenerateThumbnails,
  onConfirm,
  onCancel,
}: IndexConfirmDialogProps) {
  const [generateThumbnails, setGenerateThumbnails] = useState(defaultGenerateThumbnails);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-1">Index Drive</h2>
        <p className="text-sm text-gray-400 mb-4">
          Scan all media files on{' '}
          <span className="text-white font-medium">{driveName}</span>
        </p>

        <label className="flex items-center gap-3 cursor-pointer mb-6 p-3 bg-gray-800 rounded-lg">
          <input
            type="checkbox"
            checked={generateThumbnails}
            onChange={e => setGenerateThumbnails(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <div>
            <p className="text-sm text-gray-200">Generate thumbnails</p>
            <p className="text-xs text-gray-500">Creates preview images for video and photo assets</p>
          </div>
        </label>

        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={() => onConfirm(generateThumbnails)}>
            Start Indexing
          </Button>
        </div>
      </div>
    </div>
  );
}
