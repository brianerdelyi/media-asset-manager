// Full asset detail view — opened when clicking an asset card.

import { useState, useRef, useEffect, useCallback } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { ArrowLeft, FolderOpen, ExternalLink, Pencil, Download, X, Film, Image, Music, Loader } from 'lucide-react';
import { VideoPlayer, VideoPlayerHandle } from './VideoPlayer';
import { MarkerPanel } from './MarkerPanel';
import { ClipExportConfirm } from './ClipExportConfirm';
import { TranscriptionOptionsDialog } from './TranscriptionOptionsDialog';
import { TranscriptPanel } from './TranscriptPanel';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { TagBadge } from '../common/TagBadge';
import { TagPicker } from '../common/TagPicker';
import { formatDate, formatDuration, formatFileSize, formatResolution } from '../../utils/formatters';
import { openAsset, revealAsset } from '../../commands/assets';
import { deleteMarker, updateMarker } from '../../commands/markers';
import { getSetting, setSetting } from '../../commands/settings';
import { setAssetTags } from '../../commands/tags';
import { transcriptionGet, transcriptionStart, transcriptionDelete } from '../../commands/transcription';
import { useLibraryStore } from '../../stores/libraryStore';
import { useTranscriptionStore } from '../../stores/transcriptionStore';
import { listen } from '@tauri-apps/api/event';
import type { AssetDetail, AssetMarker } from '../../types/asset';
import type { Transcript } from '../../commands/transcription';

interface AssetDetailViewProps {
  asset: AssetDetail;
  onClose: () => void;
}

function MediaIcon({ type }: { type: string }) {
  const props = { size: 48, style: { opacity: 0.2, color: 'var(--text-secondary)' } };
  if (type === 'video') return <Film {...props} />;
  if (type === 'image') return <Image {...props} />;
  return <Music {...props} />;
}

const CONTROLS_HEIGHT = 82;

export function AssetDetailView({ asset, onClose }: AssetDetailViewProps) {
  const [currentMs, setCurrentMs] = useState(0);
  const [minScrubMs, setMinScrubMs] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [exportTarget, setExportTarget] = useState<AssetMarker | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [markerPanelOpen, setMarkerPanelOpen] = useState(false);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [transcript, setTranscript] = useState<Transcript | null>(null);

  const defaultAssetName = (asset.locations[0]?.filename ?? 'clip').replace(/\.[^.]+$/, '');
  const [assetName, setAssetName] = useState(defaultAssetName);
  const [assetNameDraft, setAssetNameDraft] = useState(defaultAssetName);
  const [editingAssetName, setEditingAssetName] = useState(false);

  const [description, setDescription] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);

  const [location, setLocation] = useState('');
  const [locationDraft, setLocationDraft] = useState('');
  const [editingLocation, setEditingLocation] = useState(false);

  const leftColumnRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [videoHeight, setVideoHeight] = useState<number | null>(null);

  const computeVideoHeight = useCallback(() => {
    const col = leftColumnRef.current;
    const hdr = headerRef.current;
    if (!col || !hdr) return;
    const available = col.clientHeight - hdr.clientHeight - 16 - 12 - 16 - CONTROLS_HEIGHT;
    if (available > 40) setVideoHeight(available);
  }, []);

  useEffect(() => {
    computeVideoHeight();
    const ro = new ResizeObserver(computeVideoHeight);
    if (leftColumnRef.current) ro.observe(leftColumnRef.current);
    return () => ro.disconnect();
  }, [computeVideoHeight]);

  const videoRef = useRef<VideoPlayerHandle>(null);
  const { refreshSelected } = useLibraryStore();
  const { models, activeJob, setActiveJob, fetchModels } = useTranscriptionStore();
  const installedModels = models.filter(m => m.installed);

  // Fetch models on mount if store is empty
  useEffect(() => {
    if (models.length === 0) fetchModels();
  }, []);

  const onlineLoc = asset.locations.find(l => l.is_online && !l.is_missing);
  const thumbUrl = asset.thumbnail_path ? convertFileSrc(asset.thumbnail_path) : null;
  const filename = asset.locations[0]?.filename ?? '';
  const canTranscribe = (asset.media_type === 'video' || asset.media_type === 'audio') && !!onlineLoc;

  const isTranscribing = activeJob?.assetId === asset.id;

  // Load settings and transcript on mount
  useEffect(() => {
    getSetting(`asset_name:${asset.id}`).then(v => { if (v) { setAssetName(v); setAssetNameDraft(v); } }).catch(() => {});
    getSetting(`asset_description:${asset.id}`).then(v => { if (v) { setDescription(v); setDescriptionDraft(v); } }).catch(() => {});
    getSetting(`asset_location:${asset.id}`).then(v => { if (v) { setLocation(v); setLocationDraft(v); } }).catch(() => {});
    transcriptionGet(asset.id).then(t => setTranscript(t)).catch(() => {});
  }, [asset.id]);

  // Reload transcript when job for THIS asset clears
  useEffect(() => {
    if (!isTranscribing && !transcript) {
      transcriptionGet(asset.id).then(t => { if (t) setTranscript(t); }).catch(() => {});
    }
  }, [isTranscribing]);

  // Listen for Tauri transcription:complete event
  useEffect(() => {
    const unlisten = listen<{ asset_id: string }>('transcription:complete', (e) => {
      if (e.payload.asset_id === asset.id) {
        transcriptionGet(asset.id).then(t => setTranscript(t)).catch(() => {});
      }
    });
    return () => { unlisten.then(fn => fn()); };
  }, [asset.id]);

  async function saveAssetName() {
    const name = assetNameDraft.trim() || defaultAssetName;
    setAssetName(name); setAssetNameDraft(name); setEditingAssetName(false);
    await setSetting(`asset_name:${asset.id}`, name).catch(() => {});
  }

  async function saveDescription() {
    const val = descriptionDraft.trim();
    setDescription(val); setDescriptionDraft(val); setEditingDescription(false);
    await setSetting(`asset_description:${asset.id}`, val).catch(() => {});
  }

  async function saveLocation() {
    const val = locationDraft.trim();
    setLocation(val); setLocationDraft(val); setEditingLocation(false);
    await setSetting(`asset_location:${asset.id}`, val).catch(() => {});
  }

  async function handleTagsChange(tagIds: string[]) {
    await setAssetTags(asset.id, tagIds).catch(() => {});
    refreshSelected();
  }

  async function handleOpen() {
    if (!onlineLoc) return;
    try { await openAsset(asset.id, onlineLoc.id); } catch (e) { console.error(e); }
  }

  async function handleReveal() {
    if (!onlineLoc) return;
    try { await revealAsset(asset.id, onlineLoc.id); } catch (e) { console.error(e); }
  }

  function handleMarkerClick(positionMs: number) { videoRef.current?.seekTo(positionMs); }

  function startEditingMarker(marker: AssetMarker) {
    setEditingMarkerId(marker.id); setEditingName(marker.name); setConfirmDeleteId(null);
  }

  async function saveMarkerName(markerId: string) {
    const name = editingName.trim();
    if (name) { try { await updateMarker(markerId, { name }); refreshSelected(); } catch (e) { console.error(e); } }
    setEditingMarkerId(null); setEditingName('');
  }

  async function handleDeleteConfirm(markerId: string) {
    try { await deleteMarker(markerId); refreshSelected(); } catch (e) { console.error(e); } finally { setConfirmDeleteId(null); }
  }

  function handleMarkerAdded() { setMarkerPanelOpen(false); refreshSelected(); }

  async function handleExportConfirmed() {
    if (!exportTarget) return;
    const marker = exportTarget; setExportTarget(null);
    const ext = asset.file_extension.toLowerCase();
    const safeMarkerName = marker.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const suggestedName = `${assetName}-${safeMarkerName}.${ext}`;
    const outputPath = await save({ title: 'Lossless Clip Export', defaultPath: suggestedName, filters: [{ name: `Video (.${ext})`, extensions: [ext] }] });
    if (!outputPath) return;
    setExportingId(marker.id); setExportError(null);
    try { await invoke('clip_export', { assetId: asset.id, markerId: marker.id, outputPath }); }
    catch (e) { setExportError(String(e)); } finally { setExportingId(null); }
  }

  async function handleStartTranscription(model: string, language: string, prompt: string) {
    setTxDialogOpen(false);
    setTranscript(null); // Clear so UI shows transcribing state
    try {
      const result = await transcriptionStart(asset.id, model, language, prompt);
      setActiveJob({ jobId: result.job_id, assetId: asset.id, percent: 0 });
    } catch (e) {
      console.error('Transcription failed to start:', e);
    }
  }

  async function handleDeleteTranscript() {
    try {
      await transcriptionDelete(asset.id);
      setTranscript(null);
    } catch (e) {
      console.error('Failed to delete transcript:', e);
    }
  }

  const txButtonDisabled = !onlineLoc || isTranscribing;
  const txButtonLabel = isTranscribing
    ? 'Transcribing…'
    : installedModels.length === 0
    ? 'No model — see Settings'
    : 'Generate Transcript';

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--bg-app)' }}>
      {exportTarget && (
        <ClipExportConfirm marker={exportTarget} assetDurationMs={asset.duration_ms ?? 0} assetFileSizeBytes={asset.file_size} fileExtension={asset.file_extension} onConfirm={handleExportConfirmed} onCancel={() => setExportTarget(null)} />
      )}
      {txDialogOpen && (
        <TranscriptionOptionsDialog
          assetId={asset.id}
          assetName={assetName}
          durationMs={asset.duration_ms ?? null}
          onStart={handleStartTranscription}
          onCancel={() => setTxDialogOpen(false)}
        />
      )}

      {/* Left — video */}
      <div ref={leftColumnRef} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px', gap: '12px' }}>
        <div ref={headerRef} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)', padding: '4px 0' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ flex: 1 }} />
          {onlineLoc && (
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <Button variant="primary" size="sm" onClick={handleOpen}><ExternalLink size={12} /> Open</Button>
              <Button variant="secondary" size="sm" onClick={handleReveal}><FolderOpen size={12} /> Show in Finder</Button>
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0 }}>
          {asset.media_type === 'video' && onlineLoc ? (
            <VideoPlayer ref={videoRef} filePath={onlineLoc.file_path} durationMs={asset.duration_ms ?? 0} markers={asset.markers} posterUrl={thumbUrl} minScrubMs={minScrubMs} videoHeight={videoHeight} onTimeUpdate={setCurrentMs} onMarkerClick={handleMarkerClick} />
          ) : (
            <div style={{ aspectRatio: '16/9', background: 'var(--bg-raised)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {thumbUrl ? <img src={thumbUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <MediaIcon type={asset.media_type} />}
            </div>
          )}
        </div>
      </div>

      {/* Right — metadata panel */}
      <div style={{ width: '256px', flexShrink: 0, borderLeft: '1px solid var(--border-subtle)', overflowY: 'auto', padding: '16px', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {asset.is_orphaned && (
          <div style={{ background: 'rgba(255,159,10,0.1)', border: '1px solid rgba(255,159,10,0.3)', borderRadius: '6px', padding: '8px 10px', fontSize: '11px', color: 'var(--status-orphaned)' }}>
            No active drive location
          </div>
        )}

        {/* Asset Name */}
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Asset Name</p>
          {editingAssetName ? (
            <input type="text" value={assetNameDraft} onChange={e => setAssetNameDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveAssetName(); if (e.key === 'Escape') { setAssetNameDraft(assetName); setEditingAssetName(false); } }}
              onBlur={saveAssetName} autoFocus
              style={{ width: '100%', background: 'var(--bg-raised)', border: '1px solid var(--color-accent)', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
          ) : (
            <div onClick={() => { setAssetNameDraft(assetName); setEditingAssetName(true); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', padding: '6px 8px', background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', borderRadius: '6px', cursor: 'text' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{assetName}</span>
              <Pencil size={11} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Description</p>
          {editingDescription ? (
            <textarea value={descriptionDraft} onChange={e => setDescriptionDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') { setDescriptionDraft(description); setEditingDescription(false); } }}
              onBlur={saveDescription} autoFocus rows={3}
              style={{ width: '100%', background: 'var(--bg-raised)', border: '1px solid var(--color-accent)', borderRadius: '6px', padding: '6px 8px', fontSize: '12px', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
          ) : (
            <div onClick={() => { setDescriptionDraft(description); setEditingDescription(true); }}
              style={{ minHeight: '52px', padding: '6px 8px', background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', borderRadius: '6px', cursor: 'text', display: 'flex', alignItems: description ? 'flex-start' : 'center', gap: '6px' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}>
              <span style={{ fontSize: '12px', color: description ? 'var(--text-primary)' : 'var(--text-tertiary)', lineHeight: 1.5, flex: 1 }}>
                {description || 'Add a description…'}
              </span>
              <Pencil size={11} style={{ flexShrink: 0, color: 'var(--text-tertiary)', marginTop: '2px' }} />
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>Location</p>
          {editingLocation ? (
            <input type="text" value={locationDraft} onChange={e => setLocationDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveLocation(); if (e.key === 'Escape') { setLocationDraft(location); setEditingLocation(false); } }}
              onBlur={saveLocation} autoFocus placeholder="Where was this recorded?"
              style={{ width: '100%', background: 'var(--bg-raised)', border: '1px solid var(--color-accent)', borderRadius: '6px', padding: '6px 8px', fontSize: '12px', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
          ) : (
            <div onClick={() => { setLocationDraft(location); setEditingLocation(true); }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', padding: '6px 8px', background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', borderRadius: '6px', cursor: 'text' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}>
              <span style={{ fontSize: '12px', color: location ? 'var(--text-primary)' : 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {location || 'Add a location…'}
              </span>
              <Pencil size={11} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Tags</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', marginBottom: tagPickerOpen ? '8px' : 0 }}>
            {asset.tags.map(tag => (
              <TagBadge key={tag.id} tag={tag}
                onRemove={(tagId) => handleTagsChange(asset.tags.filter(t => t.id !== tagId).map(t => t.id))} />
            ))}
            {!tagPickerOpen && (
              <button onClick={() => setTagPickerOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', fontSize: '11px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                + Add
              </button>
            )}
          </div>
          {tagPickerOpen && (
            <TagPicker selectedTagIds={asset.tags.map(t => t.id)} onChange={handleTagsChange} onClose={() => setTagPickerOpen(false)} />
          )}
        </div>

        {/* Transcript */}
        {canTranscribe && (
          <div>
            {transcript && !isTranscribing ? (
              <TranscriptPanel
                transcript={transcript}
                currentMs={currentMs}
                onSeek={ms => videoRef.current?.seekTo(ms)}
                onRetranscribe={() => setTxDialogOpen(true)}
                onDelete={handleDeleteTranscript}
              />
            ) : (
              <div>
                <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Transcript</p>
                <button
                  onClick={() => { if (!txButtonDisabled && installedModels.length > 0) setTxDialogOpen(true); }}
                  disabled={txButtonDisabled || installedModels.length === 0}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    fontSize: '12px',
                    color: txButtonDisabled || installedModels.length === 0 ? 'var(--text-tertiary)' : 'var(--color-accent)',
                    background: 'none',
                    border: '1px solid var(--border-default)',
                    borderRadius: '6px', padding: '6px 10px',
                    cursor: txButtonDisabled || installedModels.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: !onlineLoc ? 0.4 : 1,
                    width: '100%',
                  }}
                  onMouseEnter={e => { if (!txButtonDisabled && installedModels.length > 0) (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)'; }}
                >
                  {isTranscribing && <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                  {txButtonLabel}
                </button>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <DetailSection label="Metadata">
          {filename && <MetaRow label="Filename" value={filename} />}
          <MetaRow label="Type"       value={`${asset.media_type} / .${asset.file_extension}`} />
          <MetaRow label="Size"       value={formatFileSize(asset.file_size)} />
          {asset.duration_ms          && <MetaRow label="Duration"    value={formatDuration(asset.duration_ms)} mono />}
          {(asset.width || asset.height) && <MetaRow label="Resolution" value={formatResolution(asset.width, asset.height)} />}
          {asset.codec                && <MetaRow label="Codec"       value={asset.codec} />}
          {asset.frame_rate           && <MetaRow label="Frame Rate"  value={`${asset.frame_rate} fps`} />}
          {asset.sample_rate          && <MetaRow label="Sample Rate" value={`${asset.sample_rate} Hz`} />}
          <MetaRow label="Created"    value={formatDate(asset.created_at_fs)} />
          <MetaRow label="Modified"   value={formatDate(asset.modified_at_fs)} />
        </DetailSection>

        {/* Locations */}
        <DetailSection label={`Locations (${asset.locations.length})`}>
          {asset.locations.map(loc => (
            <div key={loc.id} style={{ background: 'var(--bg-raised)', borderRadius: '6px', padding: '8px 10px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{loc.drive_name}</span>
                <Badge variant={loc.is_online ? 'online' : 'offline'} dot />
                {loc.is_missing && <Badge variant="missing" />}
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', margin: 0, wordBreak: 'break-all' }}>{loc.file_path}</p>
            </div>
          ))}
        </DetailSection>

        {/* Markers */}
        {asset.media_type === 'video' && (
          <DetailSection
            label={`Markers (${asset.markers.length})`}
            action={!markerPanelOpen ? (
              <button onClick={() => setMarkerPanelOpen(true)}
                style={{ fontSize: '11px', color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                + Add
              </button>
            ) : null}
          >
            {markerPanelOpen && (
              <div style={{ marginBottom: '8px' }}>
                <MarkerPanel assetId={asset.id} markers={asset.markers} currentMs={currentMs} onMarkersChanged={handleMarkerAdded} onMarkerClick={handleMarkerClick} onConstrainScrub={setMinScrubMs} onCancel={() => { setMarkerPanelOpen(false); setMinScrubMs(null); }} />
              </div>
            )}
            {exportError && (
              <div style={{ fontSize: '11px', color: 'var(--color-danger)', background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: '5px', padding: '6px 8px', marginBottom: '8px' }}>{exportError}</div>
            )}
            {asset.markers.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {asset.markers.map(marker => {
                  const isRange = marker.end_position_ms && marker.end_position_ms > marker.position_ms;
                  const isExporting = exportingId === marker.id;
                  const isEditing = editingMarkerId === marker.id;
                  return (
                    <div key={marker.id} style={{ background: 'var(--bg-raised)', borderRadius: '6px', padding: '7px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ flexShrink: 0, width: '7px', height: '7px', borderRadius: '50%', background: 'var(--status-orphaned)' }} />
                        {isEditing ? (
                          <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveMarkerName(marker.id); if (e.key === 'Escape') { setEditingMarkerId(null); setEditingName(''); } }}
                            onBlur={() => saveMarkerName(marker.id)} autoFocus
                            style={{ flex: 1, background: 'var(--bg-overlay)', border: '1px solid var(--color-accent)', borderRadius: '4px', padding: '2px 6px', fontSize: '12px', color: 'var(--text-primary)', outline: 'none' }} />
                        ) : (
                          <button onClick={() => handleMarkerClick(marker.position_ms)}
                            style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--text-primary)', textAlign: 'left', padding: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {marker.name}
                          </button>
                        )}
                        {!isEditing && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            {isRange && onlineLoc && (
                              <ActionIcon icon={isExporting ? <span style={{ fontSize: '10px' }}>…</span> : <Download size={11} />} title="Lossless clip export" onClick={() => setExportTarget(marker)} disabled={isExporting} hoverColor="var(--color-accent)" />
                            )}
                            <ActionIcon icon={<Pencil size={11} />} title="Rename marker" onClick={() => startEditingMarker(marker)} />
                            {confirmDeleteId === marker.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <button onClick={() => handleDeleteConfirm(marker.id)} style={{ fontSize: '10px', color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Yes</button>
                                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>/</span>
                                <button onClick={() => setConfirmDeleteId(null)} style={{ fontSize: '10px', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>No</button>
                              </div>
                            ) : (
                              <ActionIcon icon={<X size={11} />} title="Delete marker" onClick={() => setConfirmDeleteId(marker.id)} hoverColor="var(--color-danger)" />
                            )}
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', margin: '3px 0 0 13px' }}>
                        {formatDuration(marker.position_ms)}{isRange && ` → ${formatDuration(marker.end_position_ms!)}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </DetailSection>
        )}
      </div>
    </div>
  );
}

function DetailSection({ label, children, action }: { label: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{label}</p>
        {action}
      </div>
      {children}
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '11px', color: 'var(--text-primary)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value}</span>
    </div>
  );
}

function ActionIcon({ icon, title, onClick, disabled, hoverColor }: {
  icon: React.ReactNode; title: string; onClick: () => void; disabled?: boolean; hoverColor?: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      style={{ background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', padding: '2px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', opacity: disabled ? 0.4 : 1 }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = hoverColor ?? 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
      {icon}
    </button>
  );
}
