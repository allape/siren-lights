/*
 * Service worker for the Siren Lights PWA.
 *
 * The app ships as one self-contained HTML document, so the "shell" is that
 * document plus the manifest and the icons that the install prompt needs.
 * Navigations are network-first, so a new deploy is picked up on the next
 * load, with the cached document as the offline fallback. Everything else is
 * cache-first with a background refresh.
 *
 * Bump CACHE_NAME whenever the shell changes shape (new files in SHELL_URLS);
 * content updates are already handled by the network-first strategy.
 */
const CACHE_PREFIX = "siren-lights-";
const CACHE_NAME = `${CACHE_PREFIX}v1`;

const SHELL_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

const SHELL_FALLBACK = new URL("./index.html", self.location).href;
const WORKER_URL = new URL("./sw.js", self.location).href;

/** Opened lazily and reused, so the fetch handler can call `waitUntil` early. */
const cachePromise = caches.open(CACHE_NAME);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await cachePromise;
      // Individual `add` calls: a single missing file must not abort install.
      await Promise.all(SHELL_URLS.map((url) => cache.add(url).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never let the worker serve its own script from a cache.
  if (url.href === WORKER_URL) return;
  // Chrome rejects respondWith() for this combination; let the browser handle it.
  if (request.cache === "only-if-cached" && request.mode !== "same-origin") return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  const cached = cachePromise.then((cache) => cache.match(request));
  const network = fetchAndCache(request);

  // Keep the background refresh alive even when the cached copy is returned.
  event.waitUntil(network.then(() => undefined).catch(() => undefined));
  event.respondWith(cached.then((response) => response ?? network));
});

/** Network-first so a fresh deploy wins; the cache is the offline fallback. */
async function handleNavigation(request) {
  const cache = await cachePromise;

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      // Any navigation refreshes the shell, whichever URL it was served from.
      await cache.put(SHELL_FALLBACK, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return (await cache.match(SHELL_FALLBACK)) ?? Response.error();
  }
}

async function fetchAndCache(request) {
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    const cache = await cachePromise;
    await cache.put(request, response.clone());
  }
  return response;
}
