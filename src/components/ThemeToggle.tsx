"use client";

import { useEffect, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import styles from './Header.module.css';

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  root.style.colorScheme = theme;
}

function subscribe(callback: () => void) {
  const syncStorage = (event: StorageEvent) => {
    if (event.key !== 'td-theme' || (event.newValue !== 'light' && event.newValue !== 'dark')) return;
    applyTheme(event.newValue);
    callback();
  };
  window.addEventListener('tooldur:theme', callback);
  window.addEventListener('storage', syncStorage);
  return () => {
    window.removeEventListener('tooldur:theme', callback);
    window.removeEventListener('storage', syncStorage);
  };
}
function snapshot() { return document.documentElement.dataset.theme === 'dark'; }

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, snapshot, () => false);
  useEffect(() => {
    // Reconcile after hydration: the server renders a neutral light fallback.
    try {
      const saved = localStorage.getItem('td-theme');
      if (saved !== 'dark' && saved !== 'light') return;
      applyTheme(saved);
      window.dispatchEvent(new Event('tooldur:theme'));
    } catch { /* Keep the current theme if storage is unavailable. */ }
  }, []);
  const label = dark ? 'Açık temaya geç / Switch to light theme' : 'Koyu temaya geç / Switch to dark theme';
  function toggle() {
    const theme = dark ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem('td-theme', theme); } catch { /* Theme still works without storage. */ }
    window.dispatchEvent(new Event('tooldur:theme'));
  }
  return <button type="button" className={styles.iconButton} onClick={toggle} aria-label={label} title={label}>
    {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
  </button>;
}
