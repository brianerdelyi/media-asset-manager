// Search bar — triggers on Enter or button press.

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function SearchBar({ onSearch, initialValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  function handleSearch() { onSearch(value); }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') { setValue(''); onSearch(''); }
  }

  function handleClear() { setValue(''); onSearch(''); }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search
        size={14}
        style={{
          position: 'absolute', left: '10px',
          color: 'var(--text-tertiary)', pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search by filename…"
        style={{
          width: '100%',
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          padding: '6px 32px 6px 30px',
          fontSize: '13px',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
      />
      {value && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute', right: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', padding: '2px',
            display: 'flex', alignItems: 'center',
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
