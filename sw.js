const CACHE_NAME = 'timeflow-v3';
// 只预缓存核心壳资源，音频改为运行时按需缓存（避免首装下载 32MB）
const PRECACHE = [
  './',
  './index.html',
  './flip-clock.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 音频：运行时按需缓存（点哪个存哪个），不进预缓存
  if (url.pathname.includes('/sounds/')) {
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(req).then((cached) =>
          cached || fetch(req).then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached)
        )
      )
    );
    return;
  }

  // 其余同源资源：缓存优先，回退网络；离线时导航请求回退到缓存首页
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        }).catch(() => {
          if (req.mode === 'navigate') return caches.match('./flip-clock.html');
          return null;
        });
      })
    );
  }
});
