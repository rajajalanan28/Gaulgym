const CACHE_NAME = 'gaulgym-v2';

self.addEventListener('install', (event) => {
  // Segera aktifkan SW baru ini tanpa menunggu tab ditutup
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Hapus cache versi lama yang bikin nyangkut (v1)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network-First strategy agar tidak terjadi bentrok chunk Next.js saat redeploy
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
