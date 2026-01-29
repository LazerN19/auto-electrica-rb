// SW básico: cachea el "app shell" y assets estáticos.
// No rompe nada y permite instalación PWA.

const CACHE_NAME = "aerb-cache-v1";
const APP_SHELL = ["/", "/manifest.webmanifest"];

// Instala y precachea
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

// Activa
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Estrategia simple:
// - Navegación: network-first (si falla, cache)
// - Assets: cache-first
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo misma origin
  if (url.origin !== self.location.origin) return;

  // Navegación (document)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Assets estáticos: cache first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
