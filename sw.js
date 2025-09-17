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
  '/assets/Once_Upon_a_December-Anastasia.mp3',
  '/assets/The_Promised_Neverland.mp3',
  '/assets/Wiegenlied_Lullaby-Brahms.mp3',
  '/assets/Air_on_the_G_String-Johann_Sebastian_Bach.mp3',
  '/assets/twinkle-twinkle-little-star.mp3',
  '/assets/Passacaglia-Handel-Halvorsen.mp3',
  '/assets/Its_a_small_world-Walt_Disney.mp3',
  '/assets/Davy_Jones-Pirates_of_the_Caribbean.mp3',
  '/assets/Nocturne_op_9_No_2-Chopin.mp3',
  '/assets/Auld_Lang_Syne_The_New_Year_Anthem.mp3',
  '/assets/Canon_in_D-Johann_Pachelbel.mp3',

  // Tambahan sinkron sama ONLINE_LINKS
  '/assets/Greensleeves-English_Folk_Song.mp3',
  '/assets/Hide_and_Seek-Ho-ong-i_feat_SeeU.mp3',
  '/assets/Hymne_a_l_amour-Edith_Piaf.mp3',
  '/assets/La_Vie_En_Rose.mp3',
  '/assets/Mariage_D_amour_Wedding_of_Love-Richard_Clayderman.mp3',
  '/assets/Memories.mp3',
  '/assets/Old_Doll-Amacha_Music_Studio.mp3',
  '/assets/Over_the_Rainbow.mp3',
  '/assets/Toreador_Song-Bizet.mp3'
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
