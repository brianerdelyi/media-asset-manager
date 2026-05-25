import { useState } from 'react';
import { selectFolder } from '../../commands/drives';
import { Button } from '../common/Button';
import { Dialog, DialogTitle, DialogDescription, DialogActions, DialogInput } from '../common/Dialog';
import { IndexConfirmDialog } from '../indexing/IndexConfirmDialog';
import type { Drive } from '../../types/drive';

interface RegisterDriveDialogProps {
  onRegister: (path: string, friendlyName: string) => Promise<Drive>;
  onClose: () => void;
  onIndexNow: (drive: Drive, generateThumbnails: boolean, mediaTypes: string[]) => void;
}

export function RegisterDriveDialog({ onRegister, onClose, onIndexNow }: RegisterDriveDialogProps) {
  const [path, setPath] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredDrive, setRegisteredDrive] = useState<Drive | null>(null);

  async function handleBrowse() {
    const selected = await selectFolder();
    if (selected) {
      setPath(selected);
      if (!friendlyName) {
        const parts = selected.replace(/\\/g, '/').split('/');
        setFriendlyName(parts[parts.length - 1] || selected);
      }
    }
  }

  async function handleRegister() {
    if (!path || !friendlyName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const drive = await onRegister(path, friendlyName.trim());
      setRegisteredDrive(drive);
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }

  // Step 2 — index prompt after successful registration
  if (registeredDrive) {
    return (
      <IndexConfirmDialog
        driveName={registeredDrive.friendly_name}
        defaultGenerateThumbnails={true}
        defaultMediaTypes={['video', 'image', 'audio']}
        onConfirm={(generateThumbnails, mediaTypes) => {
          onIndexNow(registeredDrive, generateThumbnails, mediaTypes);
          onClose();
        }}
        onCancel={onClose}
      />
    );
  }

  // Step 1 — registration form
  return (
    <Dialog>
      <DialogTitle>Register Media Source</DialogTitle>
      <DialogDescription>Add a drive or folder to your media library.</DialogDescription>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
          Drive or Folder
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text" value={path} readOnly placeholder="Select a drive or folder…"
            style={{ flex: 1, background: 'var(--bg-raised)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '7px 10px', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }}
          />
          <Button variant="secondary" onClick={handleBrowse} disabled={loading}>Browse</Button>
        </div>
      </div>

      <DialogInput label="Friendly Name" value={friendlyName} onChange={setFriendlyName} placeholder="e.g. Footage Drive 01" />

      {error && (
        <p style={{ fontSize: '12px', color: 'var(--color-danger)', marginBottom: '12px' }}>{error}</p>
      )}

      <DialogActions>
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleRegister} disabled={!path || !friendlyName.trim() || loading}>
          {loading ? 'Registering…' : 'Register'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
