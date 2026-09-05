const CACHE = 'rifa-app-v1';
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
  '/js/app.js',
  '/js/rifa.js',
  '/js/nueva-rifa.js',
  '/js/plantillas.js',
  '/js/finalizadas.js',
  '/js/estadisticas.js',
  '/js/datepicker.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});