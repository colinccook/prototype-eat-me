// Service Worker for Eat Me PWA
// Provides offline caching with focus on JSON data caching

const CACHE_NAME = 'eat-me-cache-v1';
const DATA_CACHE_NAME = 'eat-me-data-cache-v1';

// Development hot-reload filter (should not be cached)
const DEV_HOT_RELOAD_PATTERN = 'hot-update';

// Static assets to cache on install (excluding index.html which uses network-first)
const STATIC_ASSETS = [
  './manifest.json',
  './favicon.svg',
  './apple-touch-icon.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      // We don't fail if some assets aren't available
      return Promise.allSettled(
        STATIC_ASSETS.map((url) => 
          cache.add(url).catch((err) => {
            console.warn('[Service Worker] Failed to cache:', url, err);
          })
        )
      );
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and stale entries
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME
          )
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // Purge stale hashed assets (JS/CSS) from the static cache so
      // the next fetch picks up the new files referenced by the fresh HTML
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.keys().then((requests) => {
          return Promise.all(
            requests
              .filter((request) => {
                const pathname = new URL(request.url).pathname;
                return pathname.match(/\/assets\/.*\.(js|css)$/);
              })
              .map((request) => {
                console.log('[Service Worker] Purging stale asset:', request.url);
                return cache.delete(request);
              })
          );
        });
      });
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Check if this is a JSON data request
  const isJsonRequest = url.pathname.endsWith('.json') || 
                         url.pathname.includes('/data/');

  // Check if this is a navigation request (HTML page load)
  const isNavigationRequest = event.request.mode === 'navigate';

  if (isJsonRequest) {
    // Network-first strategy for JSON data
    // Try network first, fall back to cache, and update cache on success
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((networkResponse) => {
            // Clone the response before caching
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
              console.log('[Service Worker] Cached JSON data:', url.pathname);
            }
            return networkResponse;
          })
          .catch(async () => {
            // Network failed, try cache
            console.log('[Service Worker] Network failed, trying cache for:', url.pathname);
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
              console.log('[Service Worker] Serving from cache:', url.pathname);
              return cachedResponse;
            }
            // No cache available, return error response
            return new Response(
              JSON.stringify({ error: 'Offline and no cached data available' }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
      })
    );
  } else if (isNavigationRequest) {
    // Network-first strategy for navigation requests (index.html)
    // Always try to get the latest HTML so hashed asset references are up to date
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Network failed, fall back to cached HTML for offline support
          console.log('[Service Worker] Network failed for navigation, trying cache');
          const cachedResponse = await caches.match(event.request);
          return cachedResponse || caches.match('./index.html');
        })
    );
  } else {
    // Cache-first strategy for static assets (JS, CSS, images, fonts)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          // Cache successful responses for static assets
          if (networkResponse.ok && !url.pathname.includes(DEV_HOT_RELOAD_PATTERN)) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_DATA_CACHE') {
    caches.delete(DATA_CACHE_NAME).then(() => {
      console.log('[Service Worker] Data cache cleared');
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  }
});
