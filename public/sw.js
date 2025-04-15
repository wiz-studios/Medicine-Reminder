// This is a simple service worker for the PWA
const CACHE_NAME = "medicine-reminder-v1"

// Add all the files you want to cache here
const urlsToCache = ["/", "/dashboard", "/settings", "/offline"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }
      return fetch(event.request).catch(() => {
        // If the fetch fails (e.g., because of a network failure),
        // we return the offline page for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/offline")
        }
        // For other requests, just return a simple error
        return new Response("Network error happened", {
          status: 408,
          headers: { "Content-Type": "text/plain" },
        })
      })
    }),
  )
})

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
