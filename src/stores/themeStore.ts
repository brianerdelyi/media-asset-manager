// Theme store — manages light/dark mode, sidebar, filter panel, and card size.

import { create } from 'zustand';

export type ThemeMode = 'system' | 'light' | 'dark';
export type CardSize = 'S' | 'M' | 'L';

export const CARD_SIZE_PX: Record<CardSize, number> = {
  S: 150,
  M: 200,
  L: 270,
};

interface ThemeStore {
  mode: ThemeMode;
  sidebarExpanded: boolean;
  filterPanelVisible: boolean;
  resolvedTheme: 'light' | 'dark';
  cardSize: CardSize;
  setMode: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  toggleFilterPanel: () => void;
  setCardSize: (size: CardSize) => void;
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

const savedMode     = (localStorage.getItem('theme-mode') as ThemeMode)       ?? 'system';
const savedSidebar  = localStorage.getItem('sidebar-expanded') === 'true';
const savedFilter   = localStorage.getItem('filter-panel-visible') !== 'false';
const savedCardSize = (localStorage.getItem('card-size') as CardSize)          ?? 'M';
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
    localStorage.setItem('card-size', size);
    set({ cardSize: size });
  },
}));

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  const { mode, setMode } = useThemeStore.getState();
  if (mode === 'system') setMode('system');
});
