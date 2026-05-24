// Status bar — indexing and transcription progress at the bottom of the window.

import { useEffect } from 'react';
import { Loader, Check, X, Mic } from 'lucide-react';
import { useIndexingStore } from '../../stores/indexingStore';
import { useTranscriptionStore } from '../../stores/transcriptionStore';
import { useThemeStore } from '../../stores/themeStore';
import { showToast } from '../../stores/toastStore';

export function IndexingProgress() {
  const { currentJob: indexJob, cancelJob: cancelIndex, clearJob } = useIndexingStore();
  const { activeJob: txJob, cancelJob: cancelTx } = useTranscriptionStore();
  const { sidebarExpanded } = useThemeStore();

  const sidebarWidth = sidebarExpanded ? 160 : 56;
  const visible = !!indexJob || !!txJob;

  useEffect(() => {
    if (!indexJob) return;
    if (indexJob.status === 'complete') {
      showToast(
        `Indexed ${indexJob.filesIndexed} asset${indexJob.filesIndexed !== 1 ? 's' : ''}${indexJob.filesSkipped > 0 ? `, ${indexJob.filesSkipped} skipped` : ''}.`,
        'success'
      );
      const t = setTimeout(() => clearJob(), 3000);
      return () => clearTimeout(t);
    }
    if (indexJob.status === 'cancelled') {
      showToast(`Indexing cancelled — ${indexJob.filesIndexed} assets indexed.`, 'info');
      const t = setTimeout(() => clearJob(), 2000);
      return () => clearTimeout(t);
    }
  }, [indexJob?.status]);

  if (!visible) return null;

  const isIndexRunning   = indexJob?.status === 'running';
  const isIndexComplete  = indexJob?.status === 'complete';
  const isIndexCancelled = indexJob?.status === 'cancelled';

  // Transcription: during the 0–5% phase (FFmpeg + model load), whisper hasn't
  // emitted any segments yet. Show a slow pulse on the bar to indicate activity.
  const txPercent = txJob?.percent ?? 0;
  const txInitialising = txPercent < 6; // FFmpeg extraction + model GPU init

  return (
    <div style={{
      position: 'fixed', bottom: 0, right: 0,
      left: `${sidebarWidth}px`,
      zIndex: 40,
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      transition: 'left 200ms ease',
    }}>

      {/* Indexing row */}
      {indexJob && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 16px' }}>
          <span style={{
            flexShrink: 0, display: 'flex', alignItems: 'center',
            color: isIndexComplete ? 'var(--status-online)' :
                   isIndexCancelled ? 'var(--text-tertiary)' : 'var(--color-accent)',
          }}>
            {isIndexRunning   && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
            {isIndexComplete  && <Check size={13} />}
            {isIndexCancelled && <X size={13} />}
          </span>
          <div style={{ flex: 1, height: '3px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              background: isIndexComplete ? 'var(--status-online)' :
                          isIndexCancelled ? 'var(--text-tertiary)' : 'var(--color-accent)',
              width: `${indexJob.percentComplete}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', minWidth: '80px', textAlign: 'right' }}>
            {isIndexRunning   && `${indexJob.filesIndexed} / ${indexJob.filesFound} files`}
            {isIndexComplete  && 'Complete'}
            {isIndexCancelled && 'Cancelled'}
          </span>
          {isIndexRunning && (
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', width: '32px', textAlign: 'right' }}>
              {indexJob.percentComplete}%
            </span>
          )}
          {isIndexRunning && (
            <button onClick={cancelIndex}
              style={{ fontSize: '12px', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Transcription row */}
      {txJob && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 16px',
          borderTop: indexJob ? '1px solid var(--border-subtle)' : 'none',
        }}>
          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: 'var(--color-accent)' }}>
            <Mic size={13} style={{ animation: txInitialising ? 'pulse 1.2s ease-in-out infinite' : 'none' }} />
          </span>
          <div style={{ flex: 1, height: '3px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              background: 'var(--color-accent)',
              width: `${txPercent}%`,
              // Pulse opacity during initialisation phase so bar is clearly alive
              animation: txInitialising ? 'barPulse 1.2s ease-in-out infinite' : 'none',
              transition: txInitialising ? 'none' : 'width 0.5s ease',
            }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
            {txInitialising ? 'Preparing…' : 'Transcribing…'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', width: '32px', textAlign: 'right' }}>
            {txPercent}%
          </span>
          <button onClick={cancelTx}
            style={{ fontSize: '12px', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            Cancel
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin     { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse    { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes barPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
}
