// Indexing status bar — slim bar pinned to the bottom of the window.
// Never blocks content. Auto-dismisses on completion after 3 seconds.

import { useEffect } from 'react';
import { useIndexingStore } from '../../stores/indexingStore';
import { showToast } from '../../stores/toastStore';

export function IndexingProgress() {
  const { currentJob, cancelJob, clearJob } = useIndexingStore();

  // Show toast on complete or cancelled, then auto-clear the bar
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

  const isRunning = currentJob.status === 'running';
  const isComplete = currentJob.status === 'complete';
  const isCancelled = currentJob.status === 'cancelled';

  return (
    <div className="fixed bottom-0 left-14 right-0 z-40 bg-gray-900 border-t border-gray-800">
      <div className="flex items-center gap-3 px-4 py-1.5">
        {/* Spinning icon while running */}
        {isRunning && (
          <svg className="w-3.5 h-3.5 text-blue-400 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {isComplete && <span className="text-green-400 text-xs flex-shrink-0">✓</span>}
        {isCancelled && <span className="text-gray-500 text-xs flex-shrink-0">✕</span>}

        {/* Progress bar */}
        <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isComplete ? 'bg-green-500' :
              isCancelled ? 'bg-gray-600' :
              'bg-blue-500'
            }`}
            style={{ width: `${currentJob.percentComplete}%` }}
          />
        </div>

        {/* Status text */}
        <span className="text-xs text-gray-500 flex-shrink-0 min-w-24 text-right">
          {isRunning && `${currentJob.filesIndexed} / ${currentJob.filesFound} files`}
          {isComplete && 'Complete'}
          {isCancelled && 'Cancelled'}
        </span>

        {/* Percent */}
        {isRunning && (
          <span className="text-xs text-gray-400 flex-shrink-0 w-8 text-right font-mono">
            {currentJob.percentComplete}%
          </span>
        )}

        {/* Cancel button */}
        {isRunning && (
          <button
            onClick={cancelJob}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
            title="Cancel indexing"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
