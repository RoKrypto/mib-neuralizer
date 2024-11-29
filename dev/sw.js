const CACHE_NAME = 'mib-neuralizer-v2';
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
  event.waitUntil(
    (async () => {
      console.log('[Service Worker] Installing...');
      const cache = await caches.open(CACHE_NAME);
      try {
        console.log('[Service Worker] Precaching assets...');
        await cache.addAll(ASSETS_TO_CACHE);
        console.log('[Service Worker] All assets cached!');
      } catch (err) {
        console.error('[Service Worker] Precaching failed:', err);
      }
    })()
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      console.log('[Service Worker] Activating...');
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        if (cacheName !== CACHE_NAME) {
          console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
          await caches.delete(cacheName);
        }
      }
      await self.clients.claim(); // Take control of clients immediately
      console.log('[Service Worker] Activation complete.');
    })()
  );
});

// Fetch event: Serve cached assets and handle special cases
self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      const requestUrl = new URL(event.request.url);

      // Handle special case for neuralizer.mp3
      if (requestUrl.pathname === '/assets/sound/neuralizer.mp3') {
        try {
          const cachedResponse = await caches.match('./assets/sound/neuralizer.mp3');
          if (cachedResponse) {
            console.log('[Service Worker] Serving neuralizer.mp3 from cache.');
            return cachedResponse;
          }
          console.log('[Service Worker] neuralizer.mp3 not found in cache, fetching from network...');
          return await fetch(event.request);
        } catch (err) {
          console.error('[Service Worker] Fetch failed for neuralizer.mp3:', err);
        }
      }

      // Default caching strategy: Network-first with cache fallback
      try {
        const networkResponse = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);

        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          console.log(`[Service Worker] Caching response for: ${event.request.url}`);
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        console.error(`[Service Worker] Network error for: ${event.request.url}`, err);
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
          return cachedResponse;
        }
        // Optionally provide a fallback response
      }
    })()
  );
});