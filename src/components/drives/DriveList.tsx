import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useDriveStore } from '../../stores/driveStore';
import { DriveStatusBadge } from './DriveStatusBadge';
import { RegisterDriveDialog } from './RegisterDriveDialog';
import { RemoveDriveDialog } from './RemoveDriveDialog';
import { Button } from '../common/Button';
import type { Drive } from '../../types/drive';

export function DriveList() {
  const { drives, loading, error, fetchDrives, addDrive, removeDrive, previewRemove, setDriveOnline } = useDriveStore();
  const [showRegister, setShowRegister] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ drive: Drive; orphaned: number } | null>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);

  useEffect(() => {
    fetchDrives();

    const unlistenConnected = listen<any>(
      'drive:connected',
      (event) => {
        const p = event.payload;
        // Handle both snake_case and camelCase from Tauri serialization
        const driveId = p.drive_id ?? p.driveId;
        const name = p.friendly_name ?? p.friendlyName;
        const msg = `connected: ${name} id:${driveId} at ${new Date().toLocaleTimeString()}`;
        setEventLog(prev => [...prev.slice(-4), msg]);
        if (driveId) setDriveOnline(driveId, true);
      }
    );

    const unlistenDisconnected = listen<any>(
      'drive:disconnected',
      (event) => {
        const p = event.payload;
        const driveId = p.drive_id ?? p.driveId;
        const name = p.friendly_name ?? p.friendlyName;
        const msg = `disconnected: ${name} id:${driveId} at ${new Date().toLocaleTimeString()}`;
        setEventLog(prev => [...prev.slice(-4), msg]);
        if (driveId) setDriveOnline(driveId, false);
      }
    );

    return () => {
      unlistenConnected.then(fn => fn());
      unlistenDisconnected.then(fn => fn());
    };
  }, [fetchDrives, setDriveOnline]);

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Media Sources</h1>
          <p className="text-sm text-gray-500 mt-0.5">Register drives and folders to index your media assets</p>
        </div>
        <Button variant="primary" onClick={() => setShowRegister(true)}>+ Add Source</Button>
      </div>

      {eventLog.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded p-3 mb-4 text-xs text-gray-400 font-mono">
          <p className="text-gray-500 mb-1">Event log (debug):</p>
          {eventLog.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}

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
          {drives.map(drive => (
            <div key={drive.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-sm">{drive.drive_type === 'network' ? '🌐' : '💾'}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{drive.friendly_name}</span>
                    <DriveStatusBadge isOnline={drive.is_online} />
                  </div>
                  <p className="text-xs text-gray-600 truncate mt-0.5">{drive.root_path}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <span className="text-xs text-gray-600">{drive.asset_count ?? 0} assets</span>
                <Button variant="danger" onClick={() => handleRemoveClick(drive)} className="text-xs py-1">Remove</Button>
              </div>
            </div>
          ))}
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
    </div>
  );
}
