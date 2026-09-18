// Welcome to Leonida — service worker
// Bump CACHE_NAME whenever you push a big update so returning visitors
// get fresh files instead of a stale cached copy.
const CACHE_NAME = "leonida-cache-v1";

// App shell + core assets needed to load offline.
// Add more image/page paths here as your site grows.
const CORE_ASSETS = [
  "index.html",
  "map.html",
  "places.html",
  "characters.html",
  "screenshots.html",
  "trailers.html",
  "manifest.json",
  "leonida/css/settings.css",
  "leonida/js/settings-core.js",
  "leonida/js/settings-ui.js",
  "leonida/music/tracks.js",
  "leonida/images/newlogo.png",
  "leonida/images/logo-mark.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("Skipping uncacheable asset:", url, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network-first for page navigations (so the countdown timer and any
// live content stay fresh), cache-first for everything else.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
