// Settings screen — library statistics, thumbnail management, orphaned assets, theme, transcription.

import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor, Download, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';
import { formatFileSize } from '../../utils/formatters';
import { showToast } from '../../stores/toastStore';
import { useThemeStore, type ThemeMode } from '../../stores/themeStore';
import { useTranscriptionStore } from '../../stores/transcriptionStore';
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
  const { mode, setMode } = useThemeStore();
  const {
    whisperStatus, models, activeDownloads,
    fetchEnvironment, fetchModels, startDownload, removeModel,
  } = useTranscriptionStore();

  useEffect(() => {
    loadStats();
    fetchEnvironment();
    fetchModels();
  }, []);

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

  async function handleDownloadModel(name: string) {
    try {
      await startDownload(name);
    } catch (e) {
      showToast(`Download failed: ${String(e)}`, 'error');
    }
  }

  async function handleDeleteModel(name: string) {
    try {
      await removeModel(name);
      showToast(`Model "${name}" deleted.`, 'success');
    } catch (e) {
      showToast(String(e), 'error');
    }
  }

  async function handleRefreshModels() {
    await fetchModels();
    showToast('Model list refreshed.', 'info');
  }

  const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'system', label: 'System', icon: <Monitor size={13} /> },
    { value: 'light',  label: 'Light',  icon: <Sun size={13} /> },
    { value: 'dark',   label: 'Dark',   icon: <Moon size={13} /> },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: '640px', padding: '24px 24px 48px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px' }}>Settings</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Library management and storage</p>
        </div>

        {/* Appearance */}
        <Section label="Appearance">
          <Panel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 2px' }}>Theme</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Choose light, dark, or follow system setting</p>
              </div>
              <div style={{ display: 'flex', border: '1px solid var(--border-default)', borderRadius: '6px', overflow: 'hidden' }}>
                {themeOptions.map(opt => (
                  <button key={opt.value} onClick={() => setMode(opt.value)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '5px', padding: '7px 4px', fontSize: '12px',
                      fontWeight: mode === opt.value ? 500 : 400,
                      background: mode === opt.value ? 'var(--color-accent)' : 'var(--bg-raised)',
                      color: mode === opt.value ? '#fff' : 'var(--text-secondary)',
                      border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>
                    {opt.icon}{opt.label}
                  </button>
                ))}
              </div>
            </div>
          </Panel>
        </Section>

        {/* Transcription */}
        <Section label="Transcription">
          <Panel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Environment status */}
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 8px', fontWeight: 500 }}>Environment</p>
                {whisperStatus === null ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>Checking…</p>
                ) : whisperStatus.found ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <CheckCircle size={13} style={{ color: 'var(--status-online)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0 }}>whisper-cli found</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0, fontFamily: 'var(--font-mono)' }}>{whisperStatus.path}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                    <AlertCircle size={13} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--color-danger)', margin: '0 0 4px' }}>whisper-cli not found</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>Install via Homebrew to enable transcription:</p>
                      <code style={{ fontSize: '11px', color: 'var(--text-primary)', background: 'var(--bg-raised)', borderRadius: '4px', padding: '3px 7px', display: 'inline-block', fontFamily: 'var(--font-mono)' }}>
                        brew install whisper-cpp
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {/* Models */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>Models</p>
                  <button
                    onClick={handleRefreshModels}
                    title="Refresh model list"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                  >
                    <RefreshCw size={11} /> Refresh
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                  Stored in ~/Library/Application Support/media-asset-manager/models/
                </p>

                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                  {models.map((model, i) => {
                    const isDownloading = model.name in activeDownloads;
                    const downloadPct = activeDownloads[model.name] ?? 0;

                    return (
                      <div key={model.name} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 12px',
                        borderBottom: i < models.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        background: 'var(--bg-raised)',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{model.name}</span>
                            {model.installed && (
                              <span style={{ fontSize: '10px', color: 'var(--status-online)', background: 'rgba(48,209,88,0.12)', borderRadius: '3px', padding: '1px 5px' }}>
                                Installed
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                            {formatFileSize(model.size_bytes)} · ~{Math.round(model.rtf * 60)}s per minute of audio
                          </p>
                          {isDownloading && (
                            <div style={{ marginTop: '6px' }}>
                              <div style={{ height: '3px', background: 'var(--border-default)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${downloadPct}%`, background: 'var(--color-accent)', borderRadius: '2px', transition: 'width 0.3s' }} />
                              </div>
                              <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: '3px 0 0' }}>
                                Downloading… {downloadPct}%
                              </p>
                            </div>
                          )}
                        </div>

                        {!isDownloading && (
                          model.installed ? (
                            <button
                              onClick={() => handleDeleteModel(model.name)}
                              title="Delete model"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                            >
                              <Trash2 size={13} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDownloadModel(model.name)}
                              disabled={!whisperStatus?.found}
                              title={whisperStatus?.found ? `Download ${model.name}` : 'whisper-cli not found'}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: whisperStatus?.found ? 'pointer' : 'not-allowed', padding: '4px', opacity: whisperStatus?.found ? 1 : 0.4 }}
                              onMouseEnter={e => { if (whisperStatus?.found) (e.currentTarget.style.opacity = '0.7'); }}
                              onMouseLeave={e => { if (whisperStatus?.found) (e.currentTarget.style.opacity = '1'); }}
                            >
                              <Download size={13} />
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Panel>
        </Section>

        {/* Library Statistics */}
        <Section label="Library Statistics">
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-surface)' }}>
            {loading ? (
              <div style={{ padding: '16px', fontSize: '13px', color: 'var(--text-tertiary)' }}>Loading…</div>
            ) : stats ? (
              <div>
                <StatRow label="Total Assets"   value={stats.total_assets.toLocaleString()} />
                <StatRow label="Video"          value={stats.total_video.toLocaleString()} indent />
                <StatRow label="Image"          value={stats.total_image.toLocaleString()} indent />
                <StatRow label="Audio"          value={stats.total_audio.toLocaleString()} indent />
                <StatRow label="Total Size"     value={formatFileSize(stats.total_size_bytes)} />
                <StatRow label="Thumbnails"     value={stats.thumbnail_count.toLocaleString()} />
                <StatRow label="Markers"        value={stats.total_markers.toLocaleString()} />
                <StatRow label="Tags"           value={stats.total_tags.toLocaleString()} />
                {stats.orphaned_assets > 0 && <StatRow label="Orphaned Assets" value={stats.orphaned_assets.toLocaleString()} highlight="warning" />}
                {stats.missing_locations > 0 && <StatRow label="Missing Files" value={stats.missing_locations.toLocaleString()} highlight="danger" />}
              </div>
            ) : (
              <div style={{ padding: '16px', fontSize: '13px', color: 'var(--text-tertiary)' }}>Failed to load statistics.</div>
            )}
          </div>
        </Section>

        {/* Thumbnails */}
        <Section label="Thumbnails">
          <Panel>
            <ActionRow
              title="Purge All Thumbnails"
              description={`Deletes all ${stats?.thumbnail_count ?? 0} thumbnail files from disk. Regenerated on next index.`}
              confirmKey="purge_thumbnails" confirmAction={confirmAction} confirmLabel="Yes, purge"
              onRequest={() => setConfirmAction('purge_thumbnails')} onConfirm={handlePurgeThumbnails} onCancel={() => setConfirmAction(null)}
              disabled={working || !stats || stats.thumbnail_count === 0} working={working}
              buttonVariant="secondary" buttonLabel="Purge"
            />
          </Panel>
        </Section>

        {/* Orphaned Assets */}
        <Section label="Orphaned Assets">
          <Panel>
            <ActionRow
              title="Delete Orphaned Assets"
              description={stats?.orphaned_assets ? `${stats.orphaned_assets} asset${stats.orphaned_assets !== 1 ? 's have' : ' has'} no drive location. Markers and tags will also be removed.` : 'No orphaned assets found.'}
              confirmKey="delete_orphaned" confirmAction={confirmAction} confirmLabel="Yes, delete"
              onRequest={() => setConfirmAction('delete_orphaned')} onConfirm={handleDeleteOrphaned} onCancel={() => setConfirmAction(null)}
              disabled={working || !stats || stats.orphaned_assets === 0} working={working}
              buttonVariant="danger" buttonLabel="Delete"
            />
          </Panel>
        </Section>

        {/* Storage */}
        <Section label="Storage">
          <Panel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <StoragePath label="Library Database" path="~/Library/Application Support/media-asset-manager/library.db" />
              <StoragePath label="Thumbnails" path="~/Library/Application Support/media-asset-manager/thumbnails/" />
              <StoragePath label="Transcription Models" path="~/Library/Application Support/media-asset-manager/models/" />
            </div>
          </Panel>
        </Section>

      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>{label}</p>
      {children}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px 16px' }}>
      {children}
    </div>
  );
}

function StatRow({ label, value, indent = false, highlight }: { label: string; value: string; indent?: boolean; highlight?: 'warning' | 'danger'; }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: indent ? '12px' : 0, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 500, color: highlight === 'warning' ? 'var(--status-orphaned)' : highlight === 'danger' ? 'var(--status-missing)' : 'var(--text-primary)', marginLeft: '16px' }}>{value}</span>
    </div>
  );
}

function ActionRow({ title, description, confirmKey, confirmAction, confirmLabel, onRequest, onConfirm, onCancel, disabled, working, buttonVariant, buttonLabel }: {
  title: string; description: string; confirmKey: string; confirmAction: string | null; confirmLabel: string;
  onRequest: () => void; onConfirm: () => void; onCancel: () => void;
  disabled: boolean; working: boolean; buttonVariant: 'secondary' | 'danger'; buttonLabel: string;
}) {
  const isConfirming = confirmAction === confirmKey;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 2px' }}>{title}</p>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>{description}</p>
      </div>
      {isConfirming ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Are you sure?</span>
          <Button variant="danger" size="sm" onClick={onConfirm} disabled={working}>{working ? 'Working…' : confirmLabel}</Button>
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        </div>
      ) : (
        <div><Button variant={buttonVariant} size="sm" onClick={onRequest} disabled={disabled}>{buttonLabel}</Button></div>
      )}
    </div>
  );
}

function StoragePath({ label, path }: { label: string; path: string }) {
  return (
    <div>
      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', margin: 0, wordBreak: 'break-all', lineHeight: 1.5 }}>{path}</p>
    </div>
  );
}
