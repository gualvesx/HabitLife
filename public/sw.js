// ── HabitLife Service Worker ──────────────────────────────────────────────
const CACHE_NAME = 'habitlife-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/alarm.mp3',
]

// ── Install: cache static assets ─────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// ── Activate: clean old caches ────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: network-first for API, cache-first for static ─────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Skip Supabase & external requests — always network
  if (url.hostname.includes('supabase') || url.hostname !== self.location.hostname) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// ── Push notifications ────────────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = { title: 'HabitLife', message: 'Você tem uma nova notificação.' }
  try { data = event.data.json() } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.message,
      icon:    '/logo.svg',
  '/alarm.mp3',
      badge:   '/logo.svg',
  '/alarm.mp3',
      vibrate: [200, 100, 200],
      tag:     'habitlife-notif',
      renotify: true,
      data:    { url: data.url || '/' },
    })
  )
})

// ── Notification click ────────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Focus existing window if open
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      return clients.openWindow(event.notification.data.url || '/')
    })
  )
})
