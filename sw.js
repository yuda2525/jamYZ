console.log('[SW] Script loaded');

const CACHE_NAME = 'yz-cache-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/style.css',
  '/assets/script.js',
  '/assets/quote-ping.mp3', // Suara quote
];

// Install SW
self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate SW
self.addEventListener('activate', event => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Intercept fetch
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }).catch(() => caches.match('/offline.html'))
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
