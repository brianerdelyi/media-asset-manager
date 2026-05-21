import { useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { LibraryView } from './components/library/LibraryView';
import { DriveList } from './components/drives/DriveList';
import { SettingsView } from './components/settings/SettingsView';
import { IndexingProgress } from './components/indexing/IndexingProgress';
import { ToastContainer } from './components/common/ToastContainer';
import { useIndexingStore } from './stores/indexingStore';
import { useDriveStore } from './stores/driveStore';
import type { IndexingProgressEvent, IndexingCompleteEvent } from './types/indexing';

type View = 'library' | 'drives' | 'settings';

function App() {
  const [view, setView] = useState<View>('library');
  const { updateProgress, completeJob, cancelledJob, currentJob } = useIndexingStore();
  const { setDriveOnline } = useDriveStore();

  const isIndexing = !!currentJob;

  useEffect(() => {
    const unlistenProgress = listen<IndexingProgressEvent>('indexing:progress', (e) => updateProgress(e.payload));
    const unlistenComplete = listen<IndexingCompleteEvent>('indexing:complete', (e) => completeJob(e.payload));
    const unlistenCancelled = listen<{ job_id: string }>('indexing:cancelled', (e) => cancelledJob(e.payload.job_id));
    const unlistenConnected = listen<{ drive_id: string }>('drive:connected', (e) => setDriveOnline(e.payload.drive_id, true));
    const unlistenDisconnected = listen<{ drive_id: string }>('drive:disconnected', (e) => setDriveOnline(e.payload.drive_id, false));
    return () => {
      unlistenProgress.then(fn => fn());
      unlistenComplete.then(fn => fn());
      unlistenCancelled.then(fn => fn());
      unlistenConnected.then(fn => fn());
      unlistenDisconnected.then(fn => fn());
    };
  }, []);

  return (
    <div className="flex h-full bg-gray-950 text-gray-100">
      <nav className="w-14 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-2">
        <NavButton icon="🎬" label="Library" active={view === 'library'} onClick={() => setView('library')} />
        <NavButton icon="💾" label="Drives" active={view === 'drives'} onClick={() => setView('drives')} />
        <div className="flex-1" />
        <NavButton icon="⚙️" label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
      </nav>

      {/* Main content — add bottom padding when status bar is visible */}
      <div className={`flex-1 overflow-hidden flex flex-col ${isIndexing ? 'pb-7' : ''}`}>
        <div className="flex-1 overflow-hidden">
          {view === 'library' && <LibraryView />}
          {view === 'drives' && <DriveList />}
          {view === 'settings' && <SettingsView />}
        </div>
      </div>

      <IndexingProgress />
      <ToastContainer />
    </div>
  );
}

interface NavButtonProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${
        active ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
      }`}
    >
      {icon}
    </button>
  );
}

export default App;
