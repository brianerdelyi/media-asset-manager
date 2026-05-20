import { useState } from 'react';
import { Button } from '../common/Button';

interface RemoveDriveDialogProps {
  driveName: string;
  orphanedCount: number;
  onConfirm: (deleteOrphaned: boolean) => Promise<void>;
  onCancel: () => void;
}

export function RemoveDriveDialog({ driveName, orphanedCount, onConfirm, onCancel }: RemoveDriveDialogProps) {
  const [deleteOrphaned, setDeleteOrphaned] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm(deleteOrphaned);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-2">Remove Media Source</h2>
        <p className="text-sm text-gray-400 mb-4">
          Remove <span className="text-white font-medium">{driveName}</span> from your library?
        </p>
        {orphanedCount > 0 && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded p-3 mb-4">
            <p className="text-sm text-yellow-300 mb-2">
              {orphanedCount} asset{orphanedCount !== 1 ? 's' : ''} will become orphaned.
            </p>
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={deleteOrphaned} onChange={e => setDeleteOrphaned(e.target.checked)} className="rounded" />
              Delete orphaned assets and their tags and markers
            </label>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </div>
    </div>
  );
}
