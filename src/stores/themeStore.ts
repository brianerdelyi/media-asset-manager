// Theme store — manages light/dark mode, sidebar, filter panel, and card size.

import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';

export const CARD_SIZE_MIN = 120;
export const CARD_SIZE_MAX = 300;
export const CARD_SIZE_DEFAULT = 180;

interface ThemeStore {
  mode: ThemeMode;
  sidebarExpanded: boolean;
  filterPanelVisible: boolean;
  resolvedTheme: 'light' | 'dark';
  cardSize: number;
  setMode: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleFilterPanel: () => void;
  setCardSize: (size: number) => void;
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

const savedMode     = (localStorage.getItem('theme-mode') as ThemeMode) ?? 'system';
const savedSidebar  = localStorage.getItem('sidebar-expanded') === 'true';
const savedFilter   = localStorage.getItem('filter-panel-visible') !== 'false';
const savedCardSize = parseInt(localStorage.getItem('card-size') ?? String(CARD_SIZE_DEFAULT), 10);
const initialResolved = applyTheme(savedMode);

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: savedMode,
  sidebarExpanded: savedSidebar,
  filterPanelVisible: savedFilter,
  resolvedTheme: initialResolved,
  cardSize: savedCardSize,

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

  toggleFilterPanel: () => {
    set(state => {
      const visible = !state.filterPanelVisible;
      localStorage.setItem('filter-panel-visible', String(visible));
      return { filterPanelVisible: visible };
    });
  },

  setCardSize: (size) => {
    const clamped = Math.max(CARD_SIZE_MIN, Math.min(CARD_SIZE_MAX, size));
    localStorage.setItem('card-size', String(clamped));
    set({ cardSize: clamped });
  },
}));

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const { mode, setMode } = useThemeStore.getState();
  if (mode === 'system') setMode('system');
});
