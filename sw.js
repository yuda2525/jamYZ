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
  '/assets/quote-ping.mp3',   // suara quote
  '/assets/bg.jpg',            // fallback image
  '/assets/bg.mp4',            // video background
  '/assets/lagu.mp3'           // audio utama
];

// Install SW: pre-cache semua asset
self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate SW: hapus cache lama
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
        .then(response => {
          // simpan request baru ke cache
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // fallback offline
          if (event.request.mode === 'navigate') return caches.match('/offline.html');
          if (event.request.destination === 'image') return caches.match('/assets/bg.jpg');
          if (event.request.destination === 'video') return caches.match('/assets/bg.mp4');
          if (event.request.destination === 'audio') return caches.match('/assets/lagu.mp3');
        });
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
