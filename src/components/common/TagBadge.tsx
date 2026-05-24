// TagBadge — small pill showing a tag name with optional remove button.

import { X } from 'lucide-react';

interface TagBadgeProps {
  tag: { id: string; name_display: string };
  onRemove?: (tagId: string) => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '11px', fontWeight: 500,
      color: 'var(--text-secondary)',
      background: 'var(--bg-raised)',
      border: '1px solid var(--border-default)',
      borderRadius: '4px',
      padding: onRemove ? '2px 4px 2px 8px' : '2px 8px',
      userSelect: 'none',
    }}>
      {tag.name_display}
      {onRemove && (
        <button
          onClick={() => onRemove(tag.id)}
          title={`Remove tag "${tag.name_display}"`}
          style={{
            display: 'flex', alignItems: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '1px', color: 'var(--text-tertiary)',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}
