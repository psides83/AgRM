const CACHE_NAME = 'agrm-offline-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [OFFLINE_URL, '/brand/app-icon-192.png', '/brand/app-icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('agrm-') && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.mode !== 'navigate') {
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
});
