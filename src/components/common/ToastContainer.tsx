// Toast notification container — renders in bottom-right corner.
// Mounted once in App.tsx, available globally.

import { useToastStore } from '../../stores/toastStore';

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm
            pointer-events-auto min-w-64 max-w-sm
            animate-in fade-in slide-in-from-bottom-2 duration-200
            ${toast.type === 'success' ? 'bg-gray-800 border border-gray-700 text-gray-100' : ''}
            ${toast.type === 'error' ? 'bg-red-900/90 border border-red-700 text-red-100' : ''}
            ${toast.type === 'info' ? 'bg-gray-800 border border-gray-700 text-gray-100' : ''}
          `}
        >
          {/* Icon */}
          <span className="flex-shrink-0 text-base">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
          </span>

          {/* Message */}
          <span className="flex-1">{toast.message}</span>

          {/* Dismiss button */}
          <button
            onClick={() => dismiss(toast.id)}
            className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors ml-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
