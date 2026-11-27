'use client';

import { useEffect, useRef } from 'react';

const BUILD_KEY = 'tooldur_budget_sync_20260808_v2';

export default function BudgetClientSync() {
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const alreadySynced = window.sessionStorage.getItem(BUILD_KEY) === '1';

    if (!alreadySynced) {
      window.sessionStorage.setItem(BUILD_KEY, '1');
      currentUrl.searchParams.set('sync', '20260808v2');
      window.location.replace(currentUrl.toString());
      return;
    }

    const refreshIfStale = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - mountedAt.current < 15000) return;
      window.location.reload();
    };

    document.addEventListener('visibilitychange', refreshIfStale);
    window.addEventListener('pageshow', refreshIfStale);

    return () => {
      document.removeEventListener('visibilitychange', refreshIfStale);
      window.removeEventListener('pageshow', refreshIfStale);
    };
  }, []);

  return null;
}
