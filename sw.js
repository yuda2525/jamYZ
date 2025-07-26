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
  '/assets/bg.mp4',
];

// Install: Simpan file ke cache
self.addEventListener('install', event => {
  console.log('[SW] Install...');
  self.skipWaiting(); // Langsung aktif
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activate: Hapus cache lama
self.addEventListener('activate', event => {
  console.log('[SW] Activate...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Hapus cache lama:', k);
          return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim(); // Langsung kontrol semua tab
});

// Fetch: Ambil dari cache dulu, kalau gagal fetch
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match('/offline.html'));
    })
  );
});

// Handle pesan dari client (ping, notif, skipWaiting)
self.addEventListener('message', event => {
  console.log('[SW] Pesan masuk:', event.data);
  
  if (event.data === 'ping') {
    console.log('[SW] ✅ Ping diterima 🚀');
    sendNotification('Ping berhasil', { body: 'Service Worker aktif bro!' });
  }

  if (event.data?.type === 'show-notif') {
    const { title, body } = event.data;
    sendNotification(title, {
      body,
      icon: '/assets/icon-192.png',
    });
  }

  if (event.data === 'skipWaiting') {
    console.log('[SW] ⚡ skipWaiting() dipanggil via message');
    self.skipWaiting();
  }
});

// Fungsi notifikasi
function sendNotification(title, options = {}) {
  if (self.registration?.showNotification) {
    self.registration.showNotification(title, {
      icon: '/assets/icon-192.png',
      ...options
    });
  } else {
    console.warn('[SW] ❗ Notifikasi tidak tersedia.');
  }
}
