import { useState } from 'react';
import { selectFolder } from '../../commands/drives';
import { Button } from '../common/Button';

interface RegisterDriveDialogProps {
  onConfirm: (path: string, friendlyName: string) => Promise<void>;
  onCancel: () => void;
}

export function RegisterDriveDialog({ onConfirm, onCancel }: RegisterDriveDialogProps) {
  const [path, setPath] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleConfirm() {
    if (!path || !friendlyName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onConfirm(path, friendlyName.trim());
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Register Media Source</h2>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Drive or Folder</label>
          <div className="flex gap-2">
            <input type="text" value={path} readOnly placeholder="Select a drive or folder..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 placeholder-gray-600" />
            <Button onClick={handleBrowse} disabled={loading}>Browse</Button>
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-sm text-gray-400 mb-1">Friendly Name</label>
          <input type="text" value={friendlyName} onChange={e => setFriendlyName(e.target.value)}
            placeholder="e.g. Footage Drive 01"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500" />
        </div>
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!path || !friendlyName.trim() || loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </div>
      </div>
    </div>
  );
}
