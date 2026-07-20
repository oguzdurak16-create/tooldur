const RUNTIME_VERSION = 'tooldur-runtime-v6';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Next.js sayfa HTML'i ve build chunk'lari service worker ile cache'lenmez.
// Bu dosya yalnizca PWA kurulabilirligini korur ve eski cache'leri temizler.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'GET_RUNTIME_VERSION' && event.source) {
    event.source.postMessage({ type: 'TOOLDUR_RUNTIME_VERSION', version: RUNTIME_VERSION });
  }
});
