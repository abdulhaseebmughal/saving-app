const CACHE_NAME = 'saveit-ai-v6';
const STATIC_CACHE = 'saveit-ai-static-v6';
const DYNAMIC_CACHE = 'saveit-ai-dynamic-v6';
const IMAGE_CACHE = 'saveit-ai-images-v6';

// Detect development mode
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Assets to cache immediately (only in production)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.jpg',
  '/icon-512.jpg'
];

// Maximum cache size
const MAX_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 30;

// Helper function to limit cache size
const limitCacheSize = (cacheName, maxSize) => {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > maxSize) {
        cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxSize));
      }
    });
  }).catch(() => {});
};

// Install event
self.addEventListener('install', (event) => {
  const mode = isDevelopment ? '🔧 DEVELOPMENT MODE' : '🚀 PRODUCTION MODE';
  console.log(`[SW] Installing service worker... ${mode}`);

  if (!isDevelopment) {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Failed to cache some static assets:', err);
        });
      })
    );
  }

  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const mode = isDevelopment ? '🔧 DEV' : '🚀 PROD';
  console.log(`[SW] Activating service worker... ${mode}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) =>
            name.startsWith('saveit-ai-') &&
            name !== STATIC_CACHE &&
            name !== DYNAMIC_CACHE &&
            name !== IMAGE_CACHE
          )
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();

  if (isDevelopment) {
    console.log('[SW] ✅ Service worker activated in DEVELOPMENT mode - ALL requests will pass through without caching');
  } else {
    console.log('[SW] ✅ Service worker activated in PRODUCTION mode - Full caching enabled');
  }
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // In development mode, COMPLETELY bypass service worker
  if (isDevelopment) {
    // Don't intercept ANYTHING in development mode
    // Let Next.js handle all requests natively
    return;
  }

  // PRODUCTION MODE - Full caching strategy
  const url = new URL(request.url);

  // Skip cross-origin requests except for known CDNs
  if (url.origin !== self.location.origin) {
    if (!url.hostname.includes('fonts.googleapis.com') &&
        !url.hostname.includes('fonts.gstatic.com') &&
        !url.hostname.includes('cdn.')) {
      return;
    }
  }

  // Skip API calls - always fetch fresh
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (request.method !== 'GET') {
    return;
  }

  // Image caching strategy
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response && response.ok && response.status === 200) {
            try {
              const responseToCache = response.clone();
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, responseToCache);
                limitCacheSize(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
              }).catch(() => {});
            } catch (e) {
              console.warn('[SW] Clone failed:', e);
            }
          }
          return response;
        }).catch(() => {
          return caches.match('/icon-192.jpg').then((fallback) => {
            return fallback || new Response('', { status: 404 });
          });
        });
      })
    );
    return;
  }

  // Static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response && response.ok && response.status === 200) {
            try {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              }).catch(() => {});
            } catch (e) {
              console.warn('[SW] Clone failed:', e);
            }
          }
          return response;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // HTML pages
  if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok && response.status === 200) {
            try {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
                limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE);
              }).catch(() => {});
            } catch (e) {
              console.warn('[SW] Clone failed:', e);
            }
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/').then((fallback) => {
              return fallback || new Response('', { status: 503 });
            });
          });
        })
    );
    return;
  }

  // CSS, JS, and fonts
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response && response.ok && response.status === 200) {
            try {
              const responseToCache = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              }).catch(() => {});
            } catch (e) {
              console.warn('[SW] Clone failed:', e);
            }
          }
          return response;
        }).catch(() => {
          if (cached) return cached;
          return new Response('', { status: 408 });
        });

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: Network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok && response.status === 200) {
          try {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
              limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE);
            }).catch(() => {});
          } catch (e) {
            console.warn('[SW] Clone failed:', e);
          }
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || new Response('', { status: 503 });
        });
      })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});

// Background sync for offline actions (if supported)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
      event.waitUntil(Promise.resolve());
    }
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New update available',
      icon: '/icon-192.jpg',
      badge: '/icon-192.jpg',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'SaveIt.AI', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
