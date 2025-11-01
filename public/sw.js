// Service Worker for English Learning Town PWA
const CACHE_NAME = 'english-learning-town-v1.1.0';
const urlsToCache = [
  '/english-learning-town/',
  '/english-learning-town/index.html',
  '/english-learning-town/style.css',
  '/english-learning-town/favicon.png',
  '/english-learning-town/assets/scenes/town.png',
  '/english-learning-town/assets/scenes/town.tmj',
  '/english-learning-town/assets/scenes/home.tmj',
  '/english-learning-town/assets/shared/characters/basic/idle.json',
  '/english-learning-town/assets/shared/characters/basic/idle.png',
  '/english-learning-town/assets/shared/characters/basic/run.json',
  '/english-learning-town/assets/shared/characters/basic/run.png',
  '/english-learning-town/assets/shared/characters/basic/walk.json',
  '/english-learning-town/assets/shared/characters/basic/walk.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((fetchResponse) => {
          // Cache successful responses
          if (fetchResponse && fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return fetchResponse;
        });
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/english-learning-town/index.html');
        }
      })
  );
});

