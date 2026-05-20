// Drive management screen — drive and indexing events handled globally in App.tsx

import { useEffect, useState } from 'react';
import { useDriveStore } from '../../stores/driveStore';
import { useIndexingStore } from '../../stores/indexingStore';
import { DriveStatusBadge } from './DriveStatusBadge';
import { RegisterDriveDialog } from './RegisterDriveDialog';
import { RemoveDriveDialog } from './RemoveDriveDialog';
import { IndexConfirmDialog } from '../indexing/IndexConfirmDialog';
import { Button } from '../common/Button';
import type { Drive } from '../../types/drive';

export function DriveList() {
  const { drives, loading, error, fetchDrives, addDrive, removeDrive, previewRemove } = useDriveStore();
  const { currentJob, startJob } = useIndexingStore();
  const [showRegister, setShowRegister] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ drive: Drive; orphaned: number } | null>(null);
  const [indexTarget, setIndexTarget] = useState<Drive | null>(null);

  useEffect(() => { fetchDrives(); }, []);

  async function handleRegister(path: string, friendlyName: string) {
    await addDrive(path, friendlyName);
    setShowRegister(false);
  }

  async function handleRemoveClick(drive: Drive) {
    const { orphaned } = await previewRemove(drive.id);
    setRemoveTarget({ drive, orphaned });
  }

  async function handleRemoveConfirm(deleteOrphaned: boolean) {
    if (!removeTarget) return;
    await removeDrive(removeTarget.drive.id, deleteOrphaned);
    setRemoveTarget(null);
  }

  async function handleIndexConfirm(_generateThumbnails: boolean) {
    if (!indexTarget) return;
    setIndexTarget(null);
    try {
      await startJob(indexTarget.id, true);
    } catch (e) {
      console.error('Failed to start indexing:', e);
    }
  }

  const isIndexing = currentJob?.status === 'running';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Media Sources</h1>
          <p className="text-sm text-gray-500 mt-0.5">Register drives and folders to index your media assets</p>
        </div>
        <Button variant="primary" onClick={() => setShowRegister(true)}>+ Add Source</Button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded p-3 mb-4 text-sm text-red-400">{error}</div>
      )}
      {loading && <div className="text-sm text-gray-500">Loading...</div>}

      {!loading && drives.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg mb-1">No media sources registered</p>
          <p className="text-sm">Add a drive or folder to get started</p>
        </div>
      )}

      {drives.length > 0 && (
        <div className="space-y-2">
          {drives.map(drive => {
            const isThisDriveIndexing = isIndexing && currentJob?.driveId === drive.id;
            return (
              <div key={drive.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-sm">{drive.drive_type === 'network' ? '🌐' : '💾'}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{drive.friendly_name}</span>
                      <DriveStatusBadge isOnline={drive.is_online} />
                      {isThisDriveIndexing && (
                        <span className="text-xs text-blue-400 animate-pulse">Indexing...</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-0.5">{drive.root_path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span className="text-xs text-gray-600">{drive.asset_count ?? 0} assets</span>
                  <Button
                    variant="secondary"
                    onClick={() => setIndexTarget(drive)}
                    disabled={!drive.is_online || isIndexing}
                    className="text-xs py-1"
                  >
                    Index
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveClick(drive)}
                    disabled={isThisDriveIndexing}
                    className="text-xs py-1"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showRegister && (
        <RegisterDriveDialog onConfirm={handleRegister} onCancel={() => setShowRegister(false)} />
      )}
      {removeTarget && (
        <RemoveDriveDialog
          driveName={removeTarget.drive.friendly_name}
          orphanedCount={removeTarget.orphaned}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
      {indexTarget && (
        <IndexConfirmDialog
          driveName={indexTarget.friendly_name}
          defaultGenerateThumbnails={true}
          onConfirm={handleIndexConfirm}
          onCancel={() => setIndexTarget(null)}
        />
      )}
    </div>
  );
}
