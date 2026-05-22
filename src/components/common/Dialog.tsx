// Shared dialog shell — consistent overlay and panel for all dialogs.

interface DialogProps {
  children: React.ReactNode;
  width?: string;
}

export function Dialog({ children, width = '420px' }: DialogProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: width,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '10px',
        padding: '20px 24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        {children}
      </div>
    </div>
  );
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px' }}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
      {children}
    </p>
  );
}

export function DialogActions({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
      {children}
    </div>
  );
}

export function DialogInput({
  label, value, onChange, placeholder, readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          padding: '7px 10px',
          fontSize: '13px',
          color: 'var(--text-primary)',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
      />
    </div>
  );
}
