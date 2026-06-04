/**
 * Vite chunk-load auto-recovery.
 *
 * After a deploy (or HMR in dev), an open browser tab may still hold lazy-import
 * URLs pointing to chunk hashes that no longer exist. The first time the user
 * navigates to such a route, the dynamic `import()` rejects with:
 *
 *   TypeError: Failed to fetch dynamically imported module
 *
 * Standard SPA fix: detect the chunk-miss and reload once. We throttle reloads
 * via sessionStorage so a genuine bug (e.g. 404 due to truly missing file) doesn't
 * loop forever — after the first auto-reload, subsequent chunk errors within
 * the throttle window show the error UI instead.
 */

const STORAGE_KEY = 'ee_chunk_reload_at';
const THROTTLE_MS = 10_000;

/**
 * Returns true iff the error message matches a known dynamic-import failure
 * pattern (covers Vite dev, Vite preview, and prod-built chunks).
 */
export function isChunkLoadError(error) {
    if (!error) return false;
    const msg = String(error?.message || error || '');
    return (
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed') ||
        msg.includes('error loading dynamically imported module') ||
        /Loading chunk \d+ failed/i.test(msg)
    );
}

/**
 * Reload the page if we haven't already auto-reloaded within the throttle
 * window. Returns true if a reload was triggered, false otherwise.
 */
export function reloadOnceForChunkMiss() {
    let lastAt = 0;
    try {
        lastAt = Number(sessionStorage.getItem(STORAGE_KEY) || 0);
    } catch {
        /* private browsing */
    }
    const now = Date.now();
    if (now - lastAt < THROTTLE_MS) {
        // Already reloaded recently — don't loop. Let the error surface.
        return false;
    }
    try {
        sessionStorage.setItem(STORAGE_KEY, String(now));
    } catch {
        /* ignore */
    }
    window.location.reload();
    return true;
}

/**
 * Attach a window-level listener for Vite's preloadError event. Called once
 * from main.jsx. The event fires before React's error boundary sees the
 * rejection, so we can short-circuit the failure UI.
 */
export function installChunkReloadHandler() {
    if (typeof window === 'undefined') return;
    window.addEventListener('vite:preloadError', (event) => {
        if (reloadOnceForChunkMiss()) {
            event.preventDefault();
        }
    });
    // Also catch raw promise rejections that surface chunk misses (covers
    // production builds where the vite:preloadError event isn't emitted).
    window.addEventListener('unhandledrejection', (event) => {
        if (isChunkLoadError(event.reason)) {
            if (reloadOnceForChunkMiss()) {
                event.preventDefault();
            }
        }
    });
}
