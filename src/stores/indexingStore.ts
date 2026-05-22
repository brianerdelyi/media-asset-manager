import { create } from 'zustand';
import type { IndexingProgressEvent, IndexingCompleteEvent } from '../types/indexing';
import { startIndexing, cancelIndexing, cleanupIndexing } from '../commands/indexing';

export type IndexingStatus = 'idle' | 'running' | 'cancelled' | 'complete' | 'error';

export interface IndexingJob {
  jobId: string;
  driveId: string;
  status: IndexingStatus;
  filesFound: number;
  filesIndexed: number;
  filesSkipped: number;
  percentComplete: number;
  error: string | null;
}

interface IndexingStore {
  currentJob: IndexingJob | null;
  lastComplete: IndexingCompleteEvent | null;
  startJob: (driveId: string, incremental: boolean, generateThumbnails?: boolean, mediaTypes?: string[]) => Promise<string>;
  cancelJob: () => Promise<void>;
  updateProgress: (event: IndexingProgressEvent) => void;
  completeJob: (event: IndexingCompleteEvent) => void;
  cancelledJob: (jobId: string) => void;
  clearJob: () => void;
}

export const useIndexingStore = create<IndexingStore>((set, get) => ({
  currentJob: null,
  lastComplete: null,

  startJob: async (driveId, incremental, generateThumbnails = true, mediaTypes) => {
    const result = await startIndexing(driveId, incremental, generateThumbnails, mediaTypes);
    set({
      currentJob: {
        jobId: result.job_id,
        driveId,
        status: 'running',
        filesFound: 0,
        filesIndexed: 0,
        filesSkipped: 0,
        percentComplete: 0,
        error: null,
      },
    });
    return result.job_id;
  },

  cancelJob: async () => {
    const job = get().currentJob;
    if (!job) return;
    await cancelIndexing(job.jobId);
  },

  updateProgress: (event) => {
    set(state => {
      if (!state.currentJob || state.currentJob.jobId !== event.job_id) return state;
      return {
        currentJob: {
          ...state.currentJob,
          filesFound: event.files_found,
          filesIndexed: event.files_indexed,
          filesSkipped: event.files_skipped,
          percentComplete: event.percent_complete,
        },
      };
    });
  },

  completeJob: (event) => {
    set(state => ({
      currentJob: state.currentJob
        ? { ...state.currentJob, status: 'complete', percentComplete: 100 }
        : null,
      lastComplete: event,
    }));
    cleanupIndexing(event.job_id).catch(() => {});
  },

  cancelledJob: (jobId) => {
    set(state => ({
      currentJob: state.currentJob?.jobId === jobId
        ? { ...state.currentJob, status: 'cancelled' }
        : state.currentJob,
    }));
    cleanupIndexing(jobId).catch(() => {});
  },

  clearJob: () => set({ currentJob: null }),
}));
