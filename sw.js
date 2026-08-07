const CACHE_NAME = 'timeflow-v2';
const ASSETS = [
  './flip-clock.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './sounds/birds.mp3',
  './sounds/brown-noise.wav',
  './sounds/campfire.mp3',
  './sounds/crickets.mp3',
  './sounds/frog.mp3',
  './sounds/ocean.mp3',
  './sounds/owl.mp3',
  './sounds/pink-noise.wav',
  './sounds/rain-heavy.mp3',
  './sounds/rain-light.mp3',
  './sounds/rain-tent.mp3',
  './sounds/rain-window.mp3',
  './sounds/river.mp3',
  './sounds/seagulls.mp3',
  './sounds/thunder.mp3',
  './sounds/waterfall.mp3',
  './sounds/white-noise.wav',
  './sounds/wind.mp3',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
