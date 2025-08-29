// Version configuration for cache busting
window.APP_VERSION = '1.0.1';
window.APP_BUILD_TIME = Date.now();

// Function to get cache-busted URLs
window.getCacheBustedUrl = function(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${window.APP_VERSION}&t=${window.APP_BUILD_TIME}`;
};

// Function to force clear all caches
window.clearAllCaches = function() {
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => {
                caches.delete(name);
            });
        });
    }
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
                registration.unregister();
            });
        });
    }
    
    // Force reload
    window.location.reload(true);
};

// Mobile-specific cache clearing
window.clearMobileCaches = function() {
    // Clear all storage types that mobile browsers use
    if ('localStorage' in window) localStorage.clear();
    if ('sessionStorage' in window) sessionStorage.clear();
    
    // Clear all caches
    if ('caches' in window) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
    
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => registration.unregister());
        });
    }
    
    // Force a hard reload
    window.location.reload(true);
};