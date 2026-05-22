// Toast notification container — renders in bottom-right corner.

import { useToastStore } from '../../stores/toastStore';
import { X, Check, AlertCircle, Info } from 'lucide-react';

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '16px', right: '16px',
      zIndex: 50, display: 'flex', flexDirection: 'column', gap: '8px',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            minWidth: '240px', maxWidth: '360px',
            pointerEvents: 'auto',
            background: 'var(--bg-raised)',
            border: `1px solid ${
              toast.type === 'error' ? 'rgba(255,69,58,0.4)' :
              toast.type === 'success' ? 'rgba(48,209,88,0.3)' :
              'var(--border-default)'
            }`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          <span style={{
            flexShrink: 0,
            color: toast.type === 'success' ? 'var(--status-online)' :
                   toast.type === 'error'   ? 'var(--color-danger)' :
                   'var(--color-accent)',
          }}>
            {toast.type === 'success' && <Check size={15} />}
            {toast.type === 'error'   && <AlertCircle size={15} />}
            {toast.type === 'info'    && <Info size={15} />}
          </span>
          <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)' }}>
            {toast.message}
          </span>
          <button
            onClick={() => dismiss(toast.id)}
            style={{
              flexShrink: 0, background: 'none', border: 'none',
              cursor: 'pointer', padding: '2px',
              color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center',
            }}
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
