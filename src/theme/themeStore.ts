import { useSyncExternalStore } from 'react';
import { THEME_DEFAULT, THEME_STORAGE_KEY, ThemeName } from '../config';

const listeners = new Set<() => void>();

function getStoredOrDomTheme(): ThemeName {
  if (typeof window === 'undefined') return THEME_DEFAULT;
  const domAttr = document.documentElement.dataset.theme;
  if (domAttr === 'light' || domAttr === 'storm') return domAttr;
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'storm') return saved;
  } catch {
    // Ignore storage read errors in restricted contexts
  }
  return THEME_DEFAULT;
}

let currentTheme: ThemeName = getStoredOrDomTheme();

export function applyThemeToDom(theme: ThemeName): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'storm' ? '#0A0E11' : '#FFFFFF');
  }
}

export function setTheme(next: ThemeName): void {
  currentTheme = next;
  applyThemeToDom(next);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage write errors in restricted contexts
    }
  }
  listeners.forEach((l) => l());
}

export function toggleTheme(): void {
  const active = getSnapshot();
  setTheme(active === 'storm' ? 'light' : 'storm');
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): ThemeName {
  if (typeof document !== 'undefined') {
    const domAttr = document.documentElement.dataset.theme;
    if (domAttr === 'light' || domAttr === 'storm') {
      currentTheme = domAttr;
    }
  }
  return currentTheme;
}

function getServerSnapshot(): ThemeName {
  return THEME_DEFAULT;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    theme,
    isStorm: theme === 'storm',
    setTheme,
    toggleTheme,
  };
}

