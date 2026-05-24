// SortDropdown — a custom dropdown that respects the app design system.
// The native <select> ignores CSS variables and uses OS styling which
// can look inconsistent especially in dark mode.

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SortOption<T> {
  value: T;
  label: string;
}

interface SortDropdownProps<T> {
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  serialize: (value: T) => string;
}

export function SortDropdown<T>({ options, value, onChange, serialize }: SortDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLabel = options.find(o => serialize(o.value) === serialize(value))?.label ?? 'Sort';

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          height: '28px', padding: '0 8px',
          background: open ? 'var(--bg-overlay)' : 'var(--bg-raised)',
          border: `1px solid ${open ? 'var(--border-strong)' : 'var(--border-default)'}`,
          borderRadius: '6px',
          fontSize: '12px', color: 'var(--text-secondary)',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        {currentLabel}
        <ChevronDown size={11} style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0,
          minWidth: '150px', zIndex: 200,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          padding: '4px',
          overflow: 'hidden',
        }}>
          {options.map(opt => {
            const isActive = serialize(opt.value) === serialize(value);
            return (
              <button
                key={opt.label}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '6px 10px',
                  background: isActive ? 'var(--color-accent-subtle)' : 'none',
                  border: 'none', borderRadius: '5px',
                  fontSize: '12px',
                  color: isActive ? 'var(--color-accent)' : 'var(--text-primary)',
                  cursor: 'pointer', textAlign: 'left', gap: '12px',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'none'; }}
              >
                <span>{opt.label}</span>
                {isActive && <Check size={11} style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
