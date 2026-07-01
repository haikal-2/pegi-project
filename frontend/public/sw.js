// sw.js
const CACHE_NAME = "Pegi-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/icons.svg"
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching Files");
        return cache.addAll(urlsToCache).catch((error) => {
          console.log("Cache addAll error:", error);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log("Service Worker: Clearing Old Cache", cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Claiming clients");
        return self.clients.claim();
      })
  );
});

// Fetch event - Strategi dinamis (Network-First untuk HTML, Cache-First untuk Aset)
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests dan ekstensi Chrome
  if (event.request.method !== "GET" || event.request.url.startsWith("chrome-extension://")) return;

  // Skip external URLs (non-same-origin)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  if (event.request.mode === "navigate" || event.request.headers.get("accept").includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Jika berhasil fetch dari server, simpan versi terbarunya ke cache
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          
          console.log("Service Worker: Offline mode, serving cached HTML");
          return caches.match(event.request).then((cachedResponse) => {
             
             return cachedResponse || caches.match("/index.html");
          });
        })
    );
    return; 
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if exists
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          // Clone dan simpan ke cache
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Fallback opsional jika gambar/css gagal dimuat dan tidak ada di cache
          return new Response("Offline resource not found", {
            status: 503,
            headers: new Headers({ "Content-Type": "text/plain" }),
          });
        });
    })
  );
});

