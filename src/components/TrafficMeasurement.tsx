'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const privatePage = /^\/(?:dashboard|admin|profil|auth|giris|kayit|api)(?:\/|$)/;
const localKey = 'tooldur-traffic-browser';
const browserIdLifetime = 30 * 24 * 60 * 60 * 1000;
let lastSubmission = 0;
let pending = false;

function collectVisit() {
  if (document.visibilityState !== 'visible' || pending || Date.now() - lastSubmission < 60_000) return;
  let browser: string;
  try {
    const consent = JSON.parse(localStorage.getItem('tooldur_cookie_consent') || 'null');
    if (consent?.analytics !== true) return;

    const current = JSON.parse(localStorage.getItem(localKey) || 'null');
    if (typeof current?.id === 'string' && current.expiresAt > Date.now()) {
      browser = current.id;
    } else {
      browser = crypto.randomUUID();
      localStorage.setItem(localKey, JSON.stringify({ id: browser, expiresAt: Date.now() + browserIdLifetime }));
    }
  } catch {
    return;
  }

  pending = true;
  void fetch('/api/traffic/visit', {
    method: 'POST',
    body: browser,
    keepalive: true,
    credentials: 'omit',
  }).then(response => {
    if (response.ok) lastSubmission = Date.now();
  }).catch(() => {
    // The next eligible navigation can retry.
  }).finally(() => {
    pending = false;
  });
}

export default function TrafficMeasurement() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || privatePage.test(pathname)) return;
    collectVisit();
    window.addEventListener('tooldur:analytics-consent', collectVisit);
    document.addEventListener('visibilitychange', collectVisit);
    return () => {
      window.removeEventListener('tooldur:analytics-consent', collectVisit);
      document.removeEventListener('visibilitychange', collectVisit);
    };
  }, [pathname]);

  return null;
}
