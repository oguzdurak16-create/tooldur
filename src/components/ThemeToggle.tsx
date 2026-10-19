"use client";

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import styles from './Header.module.css';

function subscribe(callback: () => void) {
  window.addEventListener('tooldur:theme', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('tooldur:theme', callback);
    window.removeEventListener('storage', callback);
  };
}
function snapshot() { return document.documentElement.dataset.theme === 'dark'; }

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, snapshot, () => false);
  const label = dark ? 'Açık temaya geç / Switch to light theme' : 'Koyu temaya geç / Switch to dark theme';
  function toggle() {
    const theme = dark ? 'light' : 'dark';
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.style.colorScheme = theme;
    try { localStorage.setItem('td-theme', theme); } catch { /* Theme still works without storage. */ }
    window.dispatchEvent(new Event('tooldur:theme'));
  }
  return <button type="button" className={styles.iconButton} onClick={toggle} aria-label={label} title={label}>
    {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
  </button>;
}
