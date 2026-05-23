// Theme store — manages light/dark mode and sidebar state.
// Persists preferences to settings via localStorage for now,
// will migrate to settings commands in a follow-up.

import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  sidebarExpanded: boolean;
  resolvedTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode);
  const root = document.documentElement;
  if (resolved === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
  return resolved;
}

// Load persisted preferences
const savedMode = (localStorage.getItem('theme-mode') as ThemeMode) ?? 'system';
const savedSidebar = localStorage.getItem('sidebar-expanded') === 'true';
const initialResolved = applyTheme(savedMode);

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: savedMode,
  sidebarExpanded: savedSidebar,
  resolvedTheme: initialResolved,

  setMode: (mode) => {
    localStorage.setItem('theme-mode', mode);
    const resolved = applyTheme(mode);
    set({ mode, resolvedTheme: resolved });
  },

  toggleSidebar: () => {
    set(state => {
      const expanded = !state.sidebarExpanded;
      localStorage.setItem('sidebar-expanded', String(expanded));
      return { sidebarExpanded: expanded };
    });
  },

  setSidebarExpanded: (expanded) => {
    localStorage.setItem('sidebar-expanded', String(expanded));
    set({ sidebarExpanded: expanded });
  },
}));

// Watch system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const { mode, setMode } = useThemeStore.getState();
  if (mode === 'system') setMode('system');
});
