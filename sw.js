const CACHE_NAME = 'yz-cache-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/style.css',         // Ganti sesuai file kamu
  '/assets/script.js',         // Tambah file lain yg ingin dicache
  '/assets/bg.mp4',
];

// Install: Caching awal
self.addEventListener('install', event => {
  self.skipWaiting(); // Aktifkan langsung
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// Activate: Hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Ambil dari cache dulu, fallback ke jaringan
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request)
        .then(response => {
          // Simpan di cache jika sukses fetch
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match('/offline.html')); // fallback kalau offline
    })
  );
});

// Message listener
self.addEventListener('message', event => {
  if (event.data === 'ping') {
    console.log('📡 Ping OK');
    sendNotification('Ping berhasil', { body: 'SW aktif bro!' });
  }

  if (event.data?.type === 'show-notif') {
    sendNotification(event.data.title, {
      body: event.data.body,
      icon: '/assets/icon-192.png',
    });
  }

  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Fungsi kirim notifikasi
function sendNotification(title, options) {
  self.registration.showNotification(title, options);
}
