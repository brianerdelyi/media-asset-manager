// TagPicker — Notion/Linear style search + create.
// Type to filter existing tags. Click or Enter to apply.
// If no match, Enter creates the tag. Escape closes.
// Renders as an inline card below the "+ Add" button — no floating dropdown.

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useTagStore } from '../../stores/tagStore';

interface TagPickerProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  onClose: () => void;
}

export function TagPicker({ selectedTagIds, onChange, onClose }: TagPickerProps) {
  const { tags, fetchTags, addTag } = useTagStore();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTags();
    // Focus input immediately on open
    inputRef.current?.focus();
  }, []);

  // Filter tags by query
  const filtered = query.trim()
    ? tags.filter(t => t.name_normalized.includes(query.trim().toLowerCase()))
    : tags;

  // Show "Create X" option when query doesn't exactly match any existing tag
  const queryNorm = query.trim().toLowerCase();
  const exactMatch = tags.some(t => t.name_normalized === queryNorm);
  const showCreate = queryNorm.length > 0 && !exactMatch;

  function toggleTag(tagId: string) {
    const updated = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    onChange(updated);
    // Keep picker open so user can add more tags
    setQuery('');
    inputRef.current?.focus();
  }

  async function handleCreate() {
    const name = query.trim();
    if (!name || creating) return;
    setCreating(true);
    setError(null);
    try {
      const tag = await addTag(name);
      onChange([...selectedTagIds, tag.id]);
      setQuery('');
    } catch (e) {
      setError(String(e).replace('tag_create error: ', ''));
    } finally {
      setCreating(false);
      inputRef.current?.focus();
    }
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length === 1 && !showCreate) {
        // Only one result — select it
        toggleTag(filtered[0].id);
      } else if (showCreate) {
        // No exact match — create new tag
        await handleCreate();
      } else if (filtered.length > 0) {
        // Multiple results — select first
        toggleTag(filtered[0].id);
      }
    }
  }

  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--color-accent)',
      borderRadius: '6px',
      overflow: 'hidden',
      marginBottom: '8px',
    }}>
      {/* Search input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
        <Search size={12} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setError(null); }}
          onKeyDown={handleKeyDown}
          placeholder="Search or create tag…"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontSize: '12px', color: 'var(--text-primary)',
            padding: 0,
          }}
        />
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--text-tertiary)', padding: 0, flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          Esc
        </button>
      </div>

      {/* Results list */}
      <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
        {filtered.length === 0 && !showCreate && (
          <div style={{ padding: '8px 10px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {tags.length === 0 ? 'No tags yet — type to create one' : 'No matching tags'}
          </div>
        )}

        {filtered.map(tag => {
          const selected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '7px 10px',
                background: selected ? 'var(--color-accent-subtle)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selected ? 'var(--color-accent-subtle)' : 'transparent'; }}
            >
              {/* Check indicator */}
              <span style={{
                width: '13px', height: '13px', flexShrink: 0,
                border: selected ? 'none' : '1px solid var(--border-strong)',
                borderRadius: '3px',
                background: selected ? 'var(--color-accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {selected && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{tag.name_display}</span>
            </button>
          );
        })}

        {/* Create new tag row */}
        {showCreate && (
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              width: '100%', padding: '7px 10px',
              background: 'transparent', border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
              textAlign: 'left', borderTop: filtered.length > 0 ? '1px solid var(--border-subtle)' : 'none',
              opacity: creating ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!creating) (e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <span style={{ width: '13px', height: '13px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--color-accent)', fontWeight: 500 }}>+</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {creating ? 'Creating…' : <>Create <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>"{query.trim()}"</strong></>}
            </span>
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--color-danger)', borderTop: '1px solid var(--border-subtle)' }}>
          {error}
        </div>
      )}
    </div>
  );
}
