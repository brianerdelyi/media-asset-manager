import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { LibraryView } from './components/library/LibraryView';
import { DriveList } from './components/drives/DriveList';
import { SettingsView } from './components/settings/SettingsView';
import { IndexingProgress } from './components/indexing/IndexingProgress';
import { ToastContainer } from './components/common/ToastContainer';
import { Sidebar } from './components/shell/Sidebar';
import { useIndexingStore } from './stores/indexingStore';
import { useDriveStore } from './stores/driveStore';
import { useThemeStore } from './stores/themeStore';
import { showToast } from './stores/toastStore';
import { setupTranscriptionListeners } from './stores/transcriptionStore';
import type { IndexingProgressEvent, IndexingCompleteEvent } from './types/indexing';

type View = 'library' | 'drives' | 'settings';

function App() {
  const [view, setView] = useState<View>('library');
  const { updateProgress, completeJob, cancelledJob, currentJob } = useIndexingStore();
  const { setDriveOnline } = useDriveStore();
  const { resolvedTheme } = useThemeStore();

  const isIndexing = !!currentJob;

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [resolvedTheme]);

  useEffect(() => {
    const unlistenProgress     = listen<IndexingProgressEvent>('indexing:progress',   (e) => updateProgress(e.payload));
    const unlistenComplete     = listen<IndexingCompleteEvent>('indexing:complete',    (e) => completeJob(e.payload));
    const unlistenCancelled    = listen<{ job_id: string }>('indexing:cancelled',      (e) => cancelledJob(e.payload.job_id));
    const unlistenConnected    = listen<{ drive_id: string }>('drive:connected',       (e) => setDriveOnline(e.payload.drive_id, true));
    const unlistenDisconnected = listen<{ drive_id: string }>('drive:disconnected',    (e) => setDriveOnline(e.payload.drive_id, false));

    const unlistenTxComplete    = listen<{ asset_id: string }>('transcription:complete', () => {
      showToast('Transcript ready', 'success');
    });
    const unlistenTxCancelled   = listen('transcription:cancelled', () => {
      showToast('Transcription cancelled', 'info');
    });
    const unlistenTxError       = listen<{ error: string }>('transcription:error', (e) => {
      showToast(`Transcription failed: ${e.payload.error}`, 'error');
    });
    const unlistenModelComplete = listen<{ model_name: string }>('model:download:complete', (e) => {
      showToast(`Model "${e.payload.model_name}" downloaded`, 'success');
    });
    const unlistenModelError    = listen<{ model_name: string; error: string }>('model:download:error', (e) => {
      showToast(`Download failed: ${e.payload.error}`, 'error');
    });

    setupTranscriptionListeners();

    return () => {
      unlistenProgress.then(fn => fn());
      unlistenComplete.then(fn => fn());
      unlistenCancelled.then(fn => fn());
      unlistenConnected.then(fn => fn());
      unlistenDisconnected.then(fn => fn());
      unlistenTxComplete.then(fn => fn());
      unlistenTxCancelled.then(fn => fn());
      unlistenTxError.then(fn => fn());
      unlistenModelComplete.then(fn => fn());
      unlistenModelError.then(fn => fn());
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <Sidebar view={view} onViewChange={setView} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingBottom: isIndexing ? '28px' : 0 }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {view === 'library'  && <LibraryView />}
          {view === 'drives'   && <DriveList />}
          {view === 'settings' && <SettingsView />}
        </div>
      </div>
      <IndexingProgress />
      <ToastContainer />
    </div>
  );
}

export default App;
