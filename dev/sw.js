// Define cache names
const CACHE_NAME = 'mib-neuralizer-v1'; // Increment this if you make changes to assets.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './assets/css/styles.min.css',
  './assets/img/base.png',
  './assets/img/buttons.png',
  './assets/img/favicon-dark-mode.svg',
  './assets/img/favicon-light-mode.svg',
  './assets/img/head.png',
  'https://rokrypto.github.io/mib-neuralizer/assets/img/men-in-black-neuralizer-rokrypto.jpg',
  './assets/js/scripts.min.js',
  './assets/sound/neuralizer.mp3'
];

// Install event: Precaching static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Precaching assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  return self.clients.claim(); // Take control of all clients immediately
});

// Fetch event: Network-first with cache fallback
self.addEventListener('fetch', event => {
  console.log(`[Service Worker] Fetching: ${event.request.url}`);
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Save a copy of the network response in the cache
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // Return cached response if network fails
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Optionally, you can define a fallback for uncacheable requests
        });
      })
  );
});