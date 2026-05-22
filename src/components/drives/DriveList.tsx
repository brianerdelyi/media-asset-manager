import { useEffect, useState } from 'react';
import { HardDrive, Globe, Plus } from 'lucide-react';
import { useDriveStore } from '../../stores/driveStore';
import { useIndexingStore } from '../../stores/indexingStore';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { RegisterDriveDialog } from './RegisterDriveDialog';
import { RemoveDriveDialog } from './RemoveDriveDialog';
import { IndexConfirmDialog } from '../indexing/IndexConfirmDialog';
import type { Drive } from '../../types/drive';

// Always show individual type badges — never collapse to "All media"
function MediaTypeBadges({ indexMediaTypes }: { indexMediaTypes: string }) {
  const types = indexMediaTypes.split(',').map(t => t.trim()).filter(Boolean);
  if (types.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
      {types.map(t => (
        <span key={t} style={{
          fontSize: '10px', padding: '1px 6px', borderRadius: '3px',
          background: 'var(--bg-overlay)', color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
          textTransform: 'capitalize',
        }}>
          {t}
        </span>
      ))}
    </div>
  );
}

export function DriveList() {
  const { drives, loading, error, fetchDrives, addDrive, removeDrive, previewRemove } = useDriveStore();
  const { currentJob, startJob } = useIndexingStore();
  const [showRegister, setShowRegister] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ drive: Drive; orphaned: number } | null>(null);
  const [indexTarget, setIndexTarget] = useState<Drive | null>(null);

  useEffect(() => { fetchDrives(); }, []);

  function handleIndexNow(drive: Drive, generateThumbnails: boolean, mediaTypes: string[]) {
    if (mediaTypes.length > 0) {
      startJob(drive.id, true, generateThumbnails, mediaTypes).catch(console.error);
    }
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

  function handleIndexConfirm(generateThumbnails: boolean, mediaTypes: string[]) {
    if (!indexTarget) return;
    const drive = indexTarget;
    setIndexTarget(null);
    if (mediaTypes.length > 0) {
      startJob(drive.id, true, generateThumbnails, mediaTypes).catch(console.error);
    }
  }

  const isIndexing = currentJob?.status === 'running';

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px' }}>Media Sources</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Register drives and folders to index your media assets</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowRegister(true)}><Plus size={14} /> Add Source</Button>
      </div>

      {error && <div style={{ background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--color-danger)' }}>{error}</div>}
      {loading && <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Loading…</p>}

      {!loading && drives.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>No media sources registered</p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>Add a drive or folder to get started</p>
        </div>
      )}

      {drives.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {drives.map(drive => {
            const isThisDriveIndexing = isIndexing && currentJob?.driveId === drive.id;
            const DriveIcon = drive.drive_type === 'network' ? Globe : HardDrive;
            return (
              <div key={drive.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div style={{ width: '32px', height: '32px', flexShrink: 0, background: 'var(--bg-raised)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <DriveIcon size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{drive.friendly_name}</span>
                      <Badge variant={drive.is_online ? 'online' : 'offline'} />
                      {isThisDriveIndexing && <Badge variant="indexing" />}
                      <MediaTypeBadges indexMediaTypes={drive.index_media_types ?? 'video,image,audio'} />
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{drive.root_path}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{drive.asset_count ?? 0} assets</span>
                  <Button variant="secondary" size="sm" onClick={() => setIndexTarget(drive)} disabled={!drive.is_online || isIndexing}>Index</Button>
                  <Button variant="danger" size="sm" onClick={() => handleRemoveClick(drive)} disabled={isThisDriveIndexing}>Remove</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showRegister && (
        <RegisterDriveDialog onRegister={addDrive} onClose={() => setShowRegister(false)} onIndexNow={handleIndexNow} />
      )}
      {removeTarget && (
        <RemoveDriveDialog driveName={removeTarget.drive.friendly_name} orphanedCount={removeTarget.orphaned} onConfirm={handleRemoveConfirm} onCancel={() => setRemoveTarget(null)} />
      )}
      {indexTarget && (
        <IndexConfirmDialog
          driveName={indexTarget.friendly_name}
          defaultGenerateThumbnails={true}
          defaultMediaTypes={(indexTarget.index_media_types ?? 'video,image,audio').split(',').map(t => t.trim()).filter(Boolean)}
          onConfirm={handleIndexConfirm}
          onCancel={() => setIndexTarget(null)}
        />
      )}
    </div>
  );
}
