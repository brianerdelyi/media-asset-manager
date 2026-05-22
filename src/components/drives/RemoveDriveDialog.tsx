import { useState } from 'react';
import { Button } from '../common/Button';
import { Dialog, DialogTitle, DialogDescription, DialogActions } from '../common/Dialog';

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
    <Dialog>
      <DialogTitle>Remove Media Source</DialogTitle>
      <DialogDescription>
        Remove <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{driveName}</strong> from your library?
      </DialogDescription>

      {orphanedCount > 0 && (
        <div style={{
          background: 'rgba(255,159,10,0.1)', border: '1px solid rgba(255,159,10,0.3)',
          borderRadius: '6px', padding: '12px', marginBottom: '16px',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--status-orphaned)', margin: '0 0 8px' }}>
            {orphanedCount} asset{orphanedCount !== 1 ? 's' : ''} will become orphaned.
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox" checked={deleteOrphaned}
              onChange={e => setDeleteOrphaned(e.target.checked)}
              style={{ accentColor: 'var(--color-accent)' }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Delete orphaned assets, tags and markers
            </span>
          </label>
        </div>
      )}

      <DialogActions>
        <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Removing…' : 'Remove'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
