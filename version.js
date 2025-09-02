// Version configuration for cache busting (usable in Window and Worker contexts)
(function() {
    const root = (typeof self !== 'undefined') ? self : window;
    root.APP_VERSION = '1.0.1';
    root.APP_BUILD_TIME = Date.now();

    root.getCacheBustedUrl = function(url) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}v=${root.APP_VERSION}&t=${root.APP_BUILD_TIME}`;
    };

    root.clearAllCaches = function() {
        if (typeof caches !== 'undefined') {
            caches.keys().then(names => {
                names.forEach(name => { caches.delete(name); });
            });
        }
        if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => { registration.unregister(); });
            });
        }
        if (typeof location !== 'undefined' && typeof location.reload === 'function') {
            location.reload(true);
        }
    };
})();