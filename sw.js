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
  '/assets/quote-ping.mp3', // INI yang bener, bukan bg.mp4
];

// Install: simpan cache
self.addEventListener('install', e => {
  console.log('[SW] Install');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting(); // langsung aktif tanpa nunggu
});

// Activate: hapus cache lama
self.addEventListener('activate', e => {
  console.log('[SW] Activate');
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // langsung kontrol halaman
});

// Fetch: coba cache dulu, kalau gak ada baru fetch
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(e.request, res.clone());
        return res;
      });
    }).catch(() => caches.match('/offline.html')))
  );
});

// Denger pesan dari main thread
self.addEventListener('message', e => {
  console.log('[SW] Pesan diterima:', e.data);
  if (e.data === 'ping') {
    console.log('[SW] Ping diterima!');
  }
  if (e.data === 'skipWaiting') {
    console.log('[SW] skipWaiting dipanggil');
    self.skipWaiting();
  }
});
