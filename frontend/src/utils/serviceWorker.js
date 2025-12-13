/**
 * Vietmap Service Worker Registration
 * Registers a service worker to cache map tiles for offline support
 */

/**
 * Register the Vietmap tile caching service worker
 */
export const registerVietmapServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw-vietmap.js', {
                scope: '/'
            });

            console.log('[Vietmap SW] Service Worker registered successfully:', registration.scope);

            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('[Vietmap SW] New service worker found, installing...');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'activated') {
                        console.log('[Vietmap SW] New service worker activated');
                    }
                });
            });

            return registration;
        } catch (error) {
            console.error('[Vietmap SW] Service Worker registration failed:', error);
            return null;
        }
    } else {
        console.warn('[Vietmap SW] Service Workers are not supported in this browser');
        return null;
    }
};

/**
 * Unregister the service worker (useful for debugging)
 */
export const unregisterVietmapServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
            if (registration.active?.scriptURL.includes('sw-vietmap.js')) {
                await registration.unregister();
                console.log('[Vietmap SW] Service Worker unregistered');
            }
        }
    }
};

/**
 * Clear the tile cache
 */
export const clearTileCache = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data.success);
            };

            navigator.serviceWorker.controller.postMessage(
                { type: 'CLEAR_TILE_CACHE' },
                [messageChannel.port2]
            );
        });
    }
    return false;
};

/**
 * Get cache statistics
 */
export const getTileCacheStats = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };

            navigator.serviceWorker.controller.postMessage(
                { type: 'GET_CACHE_STATS' },
                [messageChannel.port2]
            );
        });
    }
    return null;
};

/**
 * Check if service worker is active
 */
export const isServiceWorkerActive = () => {
    return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
};
