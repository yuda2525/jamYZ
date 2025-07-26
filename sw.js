const cacheName = 'yudatime-v1';
const assetsToCache = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './sw.js',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Activate event + Notifikasi ping
self.addEventListener('activate', event => {
  console.log('⚡ Service Worker aktif (Ping masuk)');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Notifikasi saat aktif
      self.registration.showNotification('Y&Z Time Aktif', {
        body: 'Aplikasi sudah siap digunakan',
        icon: './assets/icon-192.png'
      });
    })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cacheRes => {
      return cacheRes || fetch(event.request);
    })
  );
});

// Terima ping dari halaman
self.addEventListener('message', event => {
  if (event.data === 'ping') {
    console.log('📡 Ping diterima dari halaman');
    // Di sini bisa ditambah update data, sync, dll
  }
});
