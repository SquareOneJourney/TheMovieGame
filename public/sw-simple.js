// Simple Service Worker for The Movie Game
// This file is only used in production builds

const CACHE_NAME = 'movie-game-v2'
const urlsToCache = [
  '/',
  '/admin',
  '/singleplayer',
  '/multiplayer',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files')
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error)
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetch event for', event.request.url)
  
  // For HTML pages, always try network first to get fresh content
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          console.log('Service Worker: Fetched fresh HTML from network:', event.request.url)
          return response
        })
        .catch(() => {
          console.log('Service Worker: Network failed, trying cache for HTML:', event.request.url)
          return caches.match(event.request)
        })
    )
    return
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url)
          return response
        }
        
        console.log('Service Worker: Fetching from network:', event.request.url)
        return fetch(event.request)
      })
      .catch((error) => {
        console.error('Service Worker: Fetch failed', error)
        // Return a fallback page or response
        return new Response('Offline - Please check your connection', {
          status: 503,
          statusText: 'Service Unavailable'
        })
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

console.log('Service Worker: Loaded successfully')
