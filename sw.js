const SW_VERSION = 'v1.0.0';
const CORE_CACHE = `core-${SW_VERSION}`;
const RUNTIME_CACHE = `runtime-${SW_VERSION}`;

const CORE_ASSETS = [
  '/',                            // trang chủ
  '/offline.html',
  '{{ "/assets/css/style.css" | relative_url }}',
  '{{ "/assets/css/custom.css" | relative_url }}'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== CORE_CACHE && k !== RUNTIME_CACHE) return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // 1) HTML navigation: network-first, fallback offline
  if (req.mode === 'navigate' || (req.destination === 'document')) {
    e.respondWith(
      fetch(req).then(r => {
        const copy = r.clone();
        caches.open(RUNTIME_CACHE).then(c => c.put(req, copy));
        return r;
      }).catch(async () => {
        const cached = await caches.match(req);
        return cached || caches.match('/offline.html');
      })
    );
    return;
  }

  // 2) CSS/JS: stale-while-revalidate
  if (['style', 'script', 'font'].includes(req.destination)) {
    e.respondWith(staleWhileRevalidate(req));
    return;
  }

  // 3) Ảnh: cache-first (giới hạn nhẹ)
  if (req.destination === 'image') {
    e.respondWith(cacheFirst(req));
    return;
  }

  // 4) Mặc định: try network -> cache
  e.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(req);
  const network = fetch(req).then(res => {
    cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || network || fetch(req);
}

async function cacheFirst(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  cache.put(req, res.clone());
  return res;
}
