const CACHE_NAME = 'yz-cache-v5';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/style.css',
  '/assets/script.js',
  '/assets/quote-ping.mp3',
  '/assets/bg.jpg' // fallback image
];

const BG_VIDEO = '/assets/bg.mp4';
const AUDIO_ASSETS = [
  '/assets/happy_birthday_medley.m4a',
  '/assets/Moonlight_Sonata_3rd.m4a',
  '/assets/Once_Upon_a_December.m4a',
  '/assets/The_Promised_Neverland.m4a',
  '/assets/Wiegenlied_Brahms.m4a',
  '/assets/cradle-song.mp3',
  '/assets/lullaby.mp3',
  '/assets/twinkle-twinkle-little-star.mp3'
];

// Install: cache file kecil saja
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(URLS_TO_CACHE);
    self.skipWaiting();
  })());
});

// Activate: hapus cache lama
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    );
    self.clients.claim();
  })());
});

// Fetch handler
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith((async () => {
    const url = new URL(e.request.url);
    const pathname = url.pathname.toLowerCase();

    // Cek cache dulu
    const cached = await caches.match(e.request);
    if (cached) return cached;

    // Lazy cache audio/video
    const isAudio = AUDIO_ASSETS.some(a => pathname.endsWith(a.toLowerCase()));
    const isBgVideo = pathname.endsWith(BG_VIDEO.toLowerCase());

    try {
      const response = await fetch(e.request);

      if (isAudio || isBgVideo) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(e.request, response.clone());
      }

      return response;
    } catch (err) {
      // fallback audio
      if (isAudio) {
        const fallback = AUDIO_ASSETS.find(a => pathname.includes(a.split('/').pop().split('.')[0]));
        if (fallback) return caches.match(fallback);
      }

      // fallback bg image
      if (e.request.destination === 'image') return caches.match('/assets/bg.jpg');

      // fallback navigate
      if (e.request.mode === 'navigate') return caches.match('/offline.html');

      return caches.match('/offline.html');
    }
  })());
});
