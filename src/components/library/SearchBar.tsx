// Search bar — triggers on Enter or clear button. Fixed 28px height to match toolbar.

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
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '28px' }}>
      <Search size={13} style={{ position: 'absolute', left: '9px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search assets…"
        style={{
          width: '100%', height: '28px',
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          padding: '0 28px 0 28px',
          fontSize: '12px',
          color: 'var(--text-primary)',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
      />
      {value && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute', right: '7px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', padding: '2px',
            display: 'flex', alignItems: 'center',
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
