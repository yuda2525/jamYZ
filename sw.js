// ==================== SERVICE WORKER ====================
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
  '/assets/happy_birthday_medley.mp3',
  '/assets/Moonlight_Sonata_3rd.mp3',
  '/assets/Once_Upon_a_December.mp3',
  '/assets/The_Promised_Neverland.mp3',
  '/assets/Wiegenlied_Brahms.mp3',
  '/assets/cradle-song.mp3',
  '/assets/lullaby.mp3',
  '/assets/twinkle-twinkle-little-star.mp3',
  '/assets/Passacaglia-Handel-Halvorsen.mp3',
  '/assets/Its_a_small_world-Walt_Disney.mp3',
  '/assets/Davy_Jones-Pirates_of_the_Caribbean.mp3',
  '/assets/Canon_in_D-Johann_Pachelbel.mp3'
];

// ===== INSTALL =====
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([...URLS_TO_CACHE, ...AUDIO_ASSETS]);
    self.skipWaiting();
  })());
});

// ===== ACTIVATE =====
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

// ===== FETCH =====
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    if (cached) return cached;

    try {
      const response = await fetch(e.request);
      const pathname = new URL(e.request.url).pathname.toLowerCase();
      const isAudio = AUDIO_ASSETS.some(a => pathname.endsWith(a.toLowerCase()));

      if (isAudio) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(e.request, response.clone());
      }
      return response;
    } catch {
      const pathname = new URL(e.request.url).pathname;
      const audioFile = pathname.split('/').pop();
      const fallbackAudio = AUDIO_ASSETS.find(a => a.split('/').pop() === audioFile);
      if (fallbackAudio) return caches.match(fallbackAudio);

      if (e.request.destination === 'image') return caches.match('/assets/bg.jpg');
      if (e.request.mode === 'navigate') return caches.match('/offline.html');

      return caches.match('/offline.html');
    }
  })());
});
