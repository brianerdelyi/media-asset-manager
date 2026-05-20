import { DriveList } from './components/drives/DriveList';
import { IndexingProgress } from './components/indexing/IndexingProgress';

function App() {
  return (
    <div className="flex h-full flex-col bg-gray-950 text-gray-100">
      <DriveList />
      <IndexingProgress />
    </div>
  );
}

export default App;
