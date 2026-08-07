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

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data ? event.data.text() : 'Yeni indirim bulundu.' }; }
  const title = data.title || 'Merve İndirim';
  const options = {
    body: data.body || 'Takip ettiğin ürünlerde yeni bir fırsat var.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'merve-indirim',
    renotify: true,
    data: { url: data.url || '/indirim' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/indirim';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client && client.url.includes(self.location.origin)) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow ? self.clients.openWindow(url) : undefined;
    })
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
