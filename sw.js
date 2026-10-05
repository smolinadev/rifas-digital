const CACHE = 'rifa-app v19'
const FILES = [
  '/',
  '/index.html',
  '/nueva-rifa.html',
  '/rifa.html',
  '/plantillas.html',
  '/finalizadas.html',
  '/estadisticas.html',
  '/about.html',
  '/privacy.html',
  '/css/style.css',
  '/css/rifa.css',
  '/css/nueva-rifa.css',
  '/css/plantillas.css',
  '/css/estadisticas.css',
  '/css/datepicker.css',
  '/css/about.css',
  '/js/app.js',
  '/js/rifa.js',
  '/js/nueva-rifa.js',
  '/js/plantillas.js',
  '/js/plantillas-config.js',
  '/js/finalizadas.js',
  '/js/estadisticas.js',
  '/js/datepicker.js',
  '/manifest.json',
'/assets/icons/icon-32x32.png',
'/assets/icons/icon-192x192.png',
'/assets/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => 
      Promise.allSettled(FILES.map(f => c.add(f)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Archivos de afuera (CDN, fuentes): cache primero
  if (url.origin !== location.origin) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }))
    );
    return;
  }

  // Archivos propios: red primero, cache si no hay internet
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(url.pathname, copy));
      }
      return res;
    }).catch(() =>
      caches.match(e.request, { ignoreSearch: true })
        .then(r => r || caches.match('/index.html'))
    )
  );
});