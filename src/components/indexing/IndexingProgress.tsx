// Indexing status bar — slim bar pinned to the bottom of the window.
// Left offset tracks sidebar width (collapsed 56px, expanded 160px).

import { useEffect } from 'react';
import { Loader, Check, X } from 'lucide-react';
import { useIndexingStore } from '../../stores/indexingStore';
import { useThemeStore } from '../../stores/themeStore';
import { showToast } from '../../stores/toastStore';

export function IndexingProgress() {
  const { currentJob, cancelJob, clearJob } = useIndexingStore();
  const { sidebarExpanded } = useThemeStore();

  const sidebarWidth = sidebarExpanded ? 160 : 56;

  useEffect(() => {
    if (!currentJob) return;
    if (currentJob.status === 'complete') {
      showToast(
        `Indexed ${currentJob.filesIndexed} asset${currentJob.filesIndexed !== 1 ? 's' : ''}${currentJob.filesSkipped > 0 ? `, ${currentJob.filesSkipped} skipped` : ''}.`,
        'success'
      );
      const timer = setTimeout(() => clearJob(), 3000);
      return () => clearTimeout(timer);
    }
    if (currentJob.status === 'cancelled') {
      showToast(`Indexing cancelled — ${currentJob.filesIndexed} assets indexed.`, 'info');
      const timer = setTimeout(() => clearJob(), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentJob?.status]);

  if (!currentJob) return null;

  const isRunning   = currentJob.status === 'running';
  const isComplete  = currentJob.status === 'complete';
  const isCancelled = currentJob.status === 'cancelled';

  return (
    <div style={{
      position: 'fixed', bottom: 0, right: 0,
      left: `${sidebarWidth}px`,
      zIndex: 40,
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      transition: 'left 200ms ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 16px' }}>
        {/* Status icon */}
        <span style={{
          flexShrink: 0, display: 'flex', alignItems: 'center',
          color: isComplete ? 'var(--status-online)' :
                 isCancelled ? 'var(--text-tertiary)' :
                 'var(--color-accent)',
        }}>
          {isRunning   && <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />}
          {isComplete  && <Check size={13} />}
          {isCancelled && <X size={13} />}
        </span>

        {/* Progress bar */}
        <div style={{
          flex: 1, height: '3px',
          background: 'var(--border-subtle)',
          borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '2px',
            background: isComplete  ? 'var(--status-online)' :
                        isCancelled ? 'var(--text-tertiary)' :
                        'var(--color-accent)',
            width: `${currentJob.percentComplete}%`,
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* File count */}
        <span style={{
          fontSize: '11px', color: 'var(--text-tertiary)',
          whiteSpace: 'nowrap', minWidth: '80px', textAlign: 'right',
        }}>
          {isRunning   && `${currentJob.filesIndexed} / ${currentJob.filesFound} files`}
          {isComplete  && 'Complete'}
          {isCancelled && 'Cancelled'}
        </span>

        {/* Percent */}
        {isRunning && (
          <span style={{
            fontSize: '11px', color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)', width: '32px', textAlign: 'right',
          }}>
            {currentJob.percentComplete}%
          </span>
        )}

        {/* Cancel */}
        {isRunning && (
          <button
            onClick={cancelJob}
            style={{
              fontSize: '12px', color: 'var(--text-tertiary)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            Cancel
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
