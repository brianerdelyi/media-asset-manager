// Toast notification store — global queue of toast messages.

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  show: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

let nextId = 1;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  show: (message, type = 'success') => {
    const id = String(nextId++);
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));

    // Auto-dismiss success and info after 3 seconds
    if (type !== 'error') {
      setTimeout(() => {
        set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
      }, 3000);
    }
  },

  dismiss: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
}));

// Convenience helpers — call these from anywhere without hooks
export function showToast(message: string, type: ToastType = 'success') {
  useToastStore.getState().show(message, type);
}
