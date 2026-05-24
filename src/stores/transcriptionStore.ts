// Transcription store — manages model list, download progress, and active jobs.

import { create } from 'zustand';
import { listen } from '@tauri-apps/api/event';
import type { ModelInfo, WhisperStatus } from '../commands/transcription';
import {
  checkEnvironment, listModels, downloadModel,
  deleteModel, transcriptionCancel, transcriptionGet,
} from '../commands/transcription';

interface ActiveJob {
  jobId: string;
  assetId: string;
  percent: number;
}

interface TranscriptionStore {
  whisperStatus: WhisperStatus | null;
  models: ModelInfo[];
  activeDownloads: Record<string, number>;
  activeJob: ActiveJob | null;

  fetchEnvironment: () => Promise<void>;
  fetchModels: () => Promise<void>;
  startDownload: (modelName: string) => Promise<void>;
  removeModel: (modelName: string) => Promise<void>;
  cancelJob: () => Promise<void>;
  setActiveJob: (job: ActiveJob | null) => void;
  updateJobProgress: (jobId: string, percent: number) => void;
}

export const useTranscriptionStore = create<TranscriptionStore>((set, get) => ({
  whisperStatus: null,
  models: [],
  activeDownloads: {},
  activeJob: null,

  fetchEnvironment: async () => {
    try {
      const status = await checkEnvironment();
      set({ whisperStatus: status });
    } catch (e) {
      console.error('Failed to check whisper environment:', e);
    }
  },

  fetchModels: async () => {
    try {
      const models = await listModels();
      set({ models });
    } catch (e) {
      console.error('Failed to fetch models:', e);
    }
  },

  startDownload: async (modelName) => {
    set(state => ({ activeDownloads: { ...state.activeDownloads, [modelName]: 0 } }));
    try {
      await downloadModel(modelName);
      // Poll every 2s as fallback in case complete event is missed
      const poll = setInterval(async () => {
        const models = await listModels();
        const model = models.find(m => m.name === modelName);
        if (model?.installed) {
          clearInterval(poll);
          set(state => {
            const d = { ...state.activeDownloads };
            delete d[modelName];
            return { activeDownloads: d, models };
          });
        }
      }, 2000);
      setTimeout(() => clearInterval(poll), 30 * 60 * 1000);
    } catch (e) {
      set(state => {
        const d = { ...state.activeDownloads };
        delete d[modelName];
        return { activeDownloads: d };
      });
      throw e;
    }
  },

  removeModel: async (modelName) => {
    await deleteModel(modelName);
    await get().fetchModels();
  },

  cancelJob: async () => {
    const job = get().activeJob;
    if (job) {
      await transcriptionCancel(job.jobId);
      set({ activeJob: null });
    }
  },

  setActiveJob: (job) => {
    set({ activeJob: job });

    if (job) {
      const assetId = job.assetId;

      // Poll DB every 3s as fallback — in case transcription:complete event
      // is missed (e.g. very fast short clip completes before listener is ready)
      const poll = setInterval(async () => {
        const current = useTranscriptionStore.getState().activeJob;
        if (!current || current.assetId !== assetId) {
          clearInterval(poll);
          return;
        }
        try {
          const transcript = await transcriptionGet(assetId);
          if (transcript) {
            clearInterval(poll);
            useTranscriptionStore.setState({ activeJob: null });
          }
        } catch (_) {}
      }, 3000);

      setTimeout(() => clearInterval(poll), 3 * 60 * 60 * 1000);
    }
  },

  updateJobProgress: (jobId, percent) => {
    set(state => {
      if (!state.activeJob || state.activeJob.jobId !== jobId) return state;
      return { activeJob: { ...state.activeJob, percent } };
    });
  },
}));

// ── Global event listeners ────────────────────────────────────────────────────

export function setupTranscriptionListeners() {
  listen('transcription:progress', (event: any) => {
    const { job_id, percent } = event.payload;
    useTranscriptionStore.setState(state => {
      if (!state.activeJob || state.activeJob.jobId !== job_id) return state;
      return { activeJob: { ...state.activeJob, percent } };
    });
  });

  listen('transcription:complete', () => {
    useTranscriptionStore.setState({ activeJob: null });
    useTranscriptionStore.getState().fetchModels();
  });

  listen('transcription:cancelled', () => {
    useTranscriptionStore.setState({ activeJob: null });
  });

  listen('transcription:error', () => {
    useTranscriptionStore.setState({ activeJob: null });
  });

  listen('model:download:progress', (event: any) => {
    const { model_name, percent } = event.payload;
    useTranscriptionStore.setState(state => ({
      activeDownloads: { ...state.activeDownloads, [model_name]: percent },
    }));
  });

  listen('model:download:complete', (event: any) => {
    const { model_name } = event.payload;
    useTranscriptionStore.setState(state => {
      const d = { ...state.activeDownloads };
      delete d[model_name];
      return { activeDownloads: d };
    });
    useTranscriptionStore.getState().fetchModels();
  });

  listen('model:download:error', (event: any) => {
    const { model_name } = event.payload;
    useTranscriptionStore.setState(state => {
      const d = { ...state.activeDownloads };
      delete d[model_name];
      return { activeDownloads: d };
    });
  });
}
