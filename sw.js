console.log('[SW] Script loaded');

const CACHE_NAME = 'yz-cache-v3';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/style.css',
  '/assets/script.js',
  '/assets/quote-ping.mp3',
  '/assets/bg.jpg',
  '/assets/bg.mp4',
  '/assets/happy_birthday_medley.mp3',
];

// Install
self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first + fallback offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(resp => caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resp.clone());
          return resp;
        }))
        .catch(() => {
          const req = event.request;
          const url = req.url.toLowerCase();

          if (req.mode === 'navigate') return caches.match('/offline.html');
          if (req.destination === 'image' || url.endsWith('.jpg') || url.endsWith('.png'))
            return caches.match('/assets/bg.jpg');
          if (req.destination === 'video' || url.endsWith('.mp4'))
            return caches.match('/assets/bg.mp4');
          if (req.destination === 'audio' || url.endsWith('.mp3'))
            return caches.match('/assets/happy_birthday_medley.mp3');

          return caches.match('/offline.html');
        })
    })
  );
});

// Message listener
self.addEventListener('message', event => {
  console.log('[SW] Pesan diterima:', event.data);

  if (event.data === 'ping') {
    console.log('[SW] Ping diterima dari halaman utama');
    event.source?.postMessage({ type: 'quote-ready' });
  }

  if (event.data === 'skipWaiting') {
    console.log('[SW] skipWaiting dipanggil');
    self.skipWaiting();
  }
});
