// Settings screen — library statistics, thumbnail management, orphaned assets.

import { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { formatFileSize } from '../../utils/formatters';
import { showToast } from '../../stores/toastStore';
import {
  getStats, deleteOrphanedAssets, purgeThumbnails,
  type LibraryStats,
} from '../../commands/settings';

type ConfirmAction = 'purge_thumbnails' | 'delete_orphaned' | null;

export function SettingsView() {
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const s = await getStats();
      setStats(s);
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteOrphaned() {
    setWorking(true);
    setConfirmAction(null);
    try {
      const count = await deleteOrphanedAssets();
      showToast(`Deleted ${count} orphaned asset${count !== 1 ? 's' : ''}.`, 'success');
      await loadStats();
    } catch (e) {
      showToast(String(e), 'error');
    } finally {
      setWorking(false);
    }
  }

  async function handlePurgeThumbnails() {
    setWorking(true);
    setConfirmAction(null);
    try {
      const count = await purgeThumbnails();
      showToast(`Deleted ${count} thumbnail${count !== 1 ? 's' : ''}.`, 'success');
      await loadStats();
    } catch (e) {
      showToast(String(e), 'error');
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-xl">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Library management and storage</p>
        </div>

        {/* Library Statistics */}
        <section className="mb-6">
          <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Library Statistics</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-4 text-sm text-gray-600">Loading...</div>
            ) : stats ? (
              <div className="divide-y divide-gray-800">
                <StatRow label="Total Assets" value={stats.total_assets.toLocaleString()} />
                <StatRow label="Video" value={stats.total_video.toLocaleString()} indent />
                <StatRow label="Image" value={stats.total_image.toLocaleString()} indent />
                <StatRow label="Audio" value={stats.total_audio.toLocaleString()} indent />
                <StatRow label="Total Size" value={formatFileSize(stats.total_size_bytes)} />
                <StatRow label="Thumbnails" value={stats.thumbnail_count.toLocaleString()} />
                <StatRow label="Markers" value={stats.total_markers.toLocaleString()} />
                <StatRow label="Tags" value={stats.total_tags.toLocaleString()} />
                {stats.orphaned_assets > 0 && (
                  <StatRow label="Orphaned Assets" value={stats.orphaned_assets.toLocaleString()} highlight="yellow" />
                )}
                {stats.missing_locations > 0 && (
                  <StatRow label="Missing Files" value={stats.missing_locations.toLocaleString()} highlight="red" />
                )}
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-600">Failed to load statistics.</div>
            )}
          </div>
        </section>

        {/* Thumbnail Management */}
        <section className="mb-6">
          <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Thumbnails</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-200">Purge All Thumbnails</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Deletes all {stats?.thumbnail_count ?? 0} thumbnail files from disk and clears paths in the library.
                  Thumbnails will be regenerated on next index.
                </p>
              </div>
              {confirmAction === 'purge_thumbnails' ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">Are you sure?</span>
                  <Button variant="danger" onClick={handlePurgeThumbnails} disabled={working} className="text-xs py-1">
                    {working ? 'Purging...' : 'Yes, purge'}
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirmAction(null)} className="text-xs py-1">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => setConfirmAction('purge_thumbnails')}
                  disabled={working || !stats || stats.thumbnail_count === 0}
                  className="text-xs flex-shrink-0"
                >
                  Purge
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Orphaned Assets */}
        <section className="mb-6">
          <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Orphaned Assets</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-200">Delete Orphaned Assets</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {stats?.orphaned_assets
                    ? `${stats.orphaned_assets} asset${stats.orphaned_assets !== 1 ? 's have' : ' has'} no drive location and cannot be accessed.`
                    : 'No orphaned assets found.'}
                  {' '}Markers and tags will also be removed.
                </p>
              </div>
              {confirmAction === 'delete_orphaned' ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">Are you sure?</span>
                  <Button variant="danger" onClick={handleDeleteOrphaned} disabled={working} className="text-xs py-1">
                    {working ? 'Deleting...' : 'Yes, delete'}
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirmAction(null)} className="text-xs py-1">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="danger"
                  onClick={() => setConfirmAction('delete_orphaned')}
                  disabled={working || !stats || stats.orphaned_assets === 0}
                  className="text-xs flex-shrink-0"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Storage Paths */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Storage</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Library Database</p>
              <p className="text-xs text-gray-400 font-mono break-all">
                ~/Library/Application Support/media-asset-manager/library.db
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Thumbnails</p>
              <p className="text-xs text-gray-400 font-mono break-all">
                ~/Library/Application Support/media-asset-manager/thumbnails/
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  indent = false,
  highlight,
}: {
  label: string;
  value: string;
  indent?: boolean;
  highlight?: 'yellow' | 'red';
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className={`text-sm ${indent ? 'text-gray-500 pl-3' : 'text-gray-300'}`}>
        {label}
      </span>
      <span className={`text-sm font-medium ${
        highlight === 'yellow' ? 'text-yellow-400' :
        highlight === 'red' ? 'text-red-400' :
        'text-gray-200'
      }`}>
        {value}
      </span>
    </div>
  );
}
