// Define the cache name
const CACHE_NAME = 'mib-neuralizer-v1';

// List of resources to pre-cache
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './assets/css/styles.min.css',
  './assets/img/base.png',
  './assets/img/buttons.png',
  './assets/img/favicon-dark-mode.svg',
  './assets/img/head.png',
  'https://rokrypto.github.io/mib-neuralizer/assets/img/men-in-black-neuralizer-rokrypto.jpg',
  './assets/js/scripts.min.js',
  './assets/sound/neuralizer.mp3'
];

// Install event: Pre-cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(ASSETS_TO_CACHE);
      } catch (error) {
        console.error('Failed to pre-cache assets:', error);
      }
    })()
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      } catch (error) {
        console.error('Failed to clean up old caches:', error);
      }
    })()
  );
  self.clients.claim(); // Take control of all clients immediately
});

// Fetch event: Cache First with Network Fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse; // Serve from cache
        }

        // Fallback to network
        const networkResponse = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        console.error('Failed to fetch resource:', error);
        throw error; // Re-throw error to propagate
      }
    })()
  );
});