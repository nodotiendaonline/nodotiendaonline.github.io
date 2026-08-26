// Service Worker de NODO — hace que la app instalada (PWA) pueda
// ABRIR incluso sin internet, mostrando la última versión guardada.
//
// ⚠️ Si en el futuro volvés a actualizar el index.html, cambiá el
// número de acá abajo (v1 -> v2, etc.) para que los celulares que ya
// tienen la app instalada bajen la versión nueva. Si no lo cambiás,
// van a seguir viendo la versión vieja guardada en caché.
const CACHE_NAME = "nodo-shell-v1";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/site.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: intenta traer la versión más nueva de internet;
// si no hay conexión, usa la última guardada.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("/index.html"))
      )
  );
});
