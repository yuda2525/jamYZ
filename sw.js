const CACHE_NAME='yz-cache-v3';
const URLS_TO_CACHE=[
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
  '/assets/happy_birthday_medley.mp3'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(URLS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(resp=>{
        caches.open(CACHE_NAME).then(cache=>cache.put(e.request,resp.clone()));
        return resp;
      }).catch(()=>{
        const req=e.request;
        const url=req.url.toLowerCase();
        if(req.mode==='navigate') return caches.match('/offline.html');
        if(req.destination==='image'||url.endsWith('.jpg')||url.endsWith('.png')) return caches.match('/assets/bg.jpg');
        if(req.destination==='video'||url.endsWith('.mp4')) return caches.match('/assets/bg.mp4');
        if(req.destination==='audio'||url.endsWith('.mp3')) return caches.match('/assets/happy_birthday_medley.mp3');
        return caches.match('/offline.html');
      });
    })
  );
});
