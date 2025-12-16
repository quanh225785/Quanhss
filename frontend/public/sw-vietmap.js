// Vietmap Tile Cache Service Worker
// This service worker caches map tiles for offline support and faster loading

const CACHE_NAME = 'vietmap-tiles-v1';
const TILE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const MAX_TILES_IN_CACHE = 500; // Limit cache size

// Install event - activate immediately
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Vietmap Tile Cache...');
    self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Vietmap Tile Cache...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('vietmap-tiles-') && name !== CACHE_NAME)
                    .map((name) => {
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - intercept tile requests
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only cache tile requests from our backend proxy
    if (url.pathname.includes('/vietmap/tiles/') && url.pathname.endsWith('.png')) {
        event.respondWith(handleTileRequest(event.request));
    }
});

/**
 * Handle tile requests with cache-first strategy
 * 1. Check cache first
 * 2. If not in cache or expired, fetch from network
 * 3. Store in cache for future use
 */
async function handleTileRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // Check if we have a valid cached response
    if (cachedResponse) {
        const cachedDate = new Date(cachedResponse.headers.get('date'));
        const now = new Date();

        // Return cached tile if it's still fresh
        if (now - cachedDate < TILE_CACHE_MAX_AGE) {
            console.log('[Service Worker] Serving tile from cache:', request.url);
            return cachedResponse;
        } else {
            console.log('[Service Worker] Cached tile expired, fetching new one');
        }
    }

    // Fetch from network
    try {
        const networkResponse = await fetch(request);

        // Only cache successful responses
        if (networkResponse.ok) {
            // Clone the response before caching
            const responseToCache = networkResponse.clone();

            // Cache the tile
            await cacheTile(cache, request, responseToCache);

            console.log('[Service Worker] Fetched and cached tile:', request.url);
        }

        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Network fetch failed:', error);

        // If network fails, return cached version even if expired
        if (cachedResponse) {
            console.log('[Service Worker] Network failed, serving stale cache');
            return cachedResponse;
        }

        // Return a placeholder or error response
        return new Response('Tile not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

/**
 * Cache a tile and manage cache size
 */
async function cacheTile(cache, request, response) {
    // Add to cache
    await cache.put(request, response);

    // Manage cache size
    const keys = await cache.keys();
    if (keys.length > MAX_TILES_IN_CACHE) {
        // Remove oldest tiles (FIFO)
        const tilesToRemove = keys.slice(0, keys.length - MAX_TILES_IN_CACHE);
        await Promise.all(tilesToRemove.map(key => cache.delete(key)));
        console.log(`[Service Worker] Removed ${tilesToRemove.length} old tiles from cache`);
    }
}

/**
 * Message handler for cache management
 */
self.addEventListener('message', (event) => {
    if (event.data.type === 'CLEAR_TILE_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME).then(() => {
                console.log('[Service Worker] Tile cache cleared');
                event.ports[0].postMessage({ success: true });
            })
        );
    }

    if (event.data.type === 'GET_CACHE_STATS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then(async (cache) => {
                const keys = await cache.keys();
                event.ports[0].postMessage({
                    cacheSize: keys.length,
                    maxSize: MAX_TILES_IN_CACHE,
                    cacheName: CACHE_NAME
                });
            })
        );
    }
});
