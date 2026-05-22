// Badge — status indicators for drives and assets.

interface BadgeProps {
  variant: 'online' | 'offline' | 'orphaned' | 'missing' | 'indexing';
  label?: string;
  dot?: boolean; // dot only, no label
}

const config = {
  online:   { color: 'var(--status-online)',   label: 'Online' },
  offline:  { color: 'var(--status-offline)',  label: 'Offline' },
  orphaned: { color: 'var(--status-orphaned)', label: 'Orphaned' },
  missing:  { color: 'var(--status-missing)',  label: 'Missing' },
  indexing: { color: 'var(--color-accent)',    label: 'Indexing' },
};

export function Badge({ variant, label, dot = false }: BadgeProps) {
  const { color, label: defaultLabel } = config[variant];
  const text = label ?? defaultLabel;

  if (dot) {
    return (
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
        title={text}
      />
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md"
      style={{
        backgroundColor: `${color}1A`,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {text}
    </span>
  );
}

// Convenience — drive status badge
export function DriveStatusBadge({ isOnline }: { isOnline: boolean }) {
  return <Badge variant={isOnline ? 'online' : 'offline'} />;
}
