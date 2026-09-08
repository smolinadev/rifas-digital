const CACHE = 'rifa-app-v5';
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
  '/js/finalizadas.js',
  '/js/estadisticas.js',
  '/js/datepicker.js',
  '/manifest.json',
'/assets/icons/icon-32x32.png',
'/assets/icons/icon-192x192.png',
'/assets/icons/icon-512x512.png',
  
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
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(r => {
      if (r) return r;
      return fetch(e.request).catch(() => caches.match('/index.html'));
    })
  );
});