// Indexing progress bar — shown during active indexing.

import { useIndexingStore } from '../../stores/indexingStore';
import { Button } from '../common/Button';

export function IndexingProgress() {
  const { currentJob, cancelJob, clearJob } = useIndexingStore();

  if (!currentJob) return null;

  const isRunning = currentJob.status === 'running';
  const isComplete = currentJob.status === 'complete';
  const isCancelled = currentJob.status === 'cancelled';
  const isDone = isComplete || isCancelled;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 z-40">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-white">
          {isRunning && 'Indexing...'}
          {isComplete && 'Indexing complete'}
          {isCancelled && 'Indexing cancelled'}
        </p>
        {isDone && (
          <button onClick={clearJob} className="text-gray-500 hover:text-gray-300 text-xs">
            ✕
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' :
            isCancelled ? 'bg-gray-500' :
            'bg-blue-500'
          }`}
          style={{ width: `${currentJob.percentComplete}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {isRunning && (
            <span>
              {currentJob.filesIndexed} / {currentJob.filesFound} files
            </span>
          )}
          {isComplete && (
            <span className="text-green-400">
              {currentJob.filesIndexed} indexed, {currentJob.filesSkipped} skipped
            </span>
          )}
          {isCancelled && (
            <span>{currentJob.filesIndexed} indexed before cancel</span>
          )}
        </div>
        {isRunning && (
          <Button variant="danger" onClick={cancelJob} className="text-xs py-0.5 px-2">
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
