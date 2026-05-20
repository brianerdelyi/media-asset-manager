// Search bar — triggers on Enter or button press.

import { useState } from 'react';
import { Button } from '../common/Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function SearchBar({ onSearch, initialValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  function handleSearch() {
    onSearch(value);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') {
      setValue('');
      onSearch('');
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search by filename..."
        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200
                   placeholder-gray-600 focus:outline-none focus:border-blue-500"
      />
      <Button variant="secondary" onClick={handleSearch}>
        Search
      </Button>
      {value && (
        <Button variant="secondary" onClick={() => { setValue(''); onSearch(''); }}>
          ✕
        </Button>
      )}
    </div>
  );
}
