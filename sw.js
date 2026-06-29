// ============================================================
//  InfoSys Service Worker
//  - Offline cache
//  - Background sync check (simulated via periodic fetch)
//  - Push notification support
// ============================================================

const CACHE_NAME = 'infosys-v22';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './quick_add.js',
  './calendar.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://unpkg.com/lucide@latest',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// ---- Install: cache static assets ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local assets only (external may fail)
      return cache.addAll([
        './',
        './index.html',
        './styles.css',
        './app.js',
        './quick_add.js',
        './calendar.js',
        './manifest.json',
        './icon-192.png',
        './icon-512.png'
      ]).catch(err => console.warn('Cache install partial:', err));
    })
  );
  self.skipWaiting();
});

// ---- Activate: clean old caches ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ---- Fetch: cache-first for local, network-first for API ----
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always network for Google Sheets API
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('google.com')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Network-first for local assets to ensure updates are visible
  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => {
      // Fallback to cache if network fails (offline mode)
      return caches.match(event.request).then(cached => {
        if (cached) return cached;
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// ---- Push notification received ----
self.addEventListener('push', event => {
  let data = { title: 'InfoSys', body: 'Bạn có thông báo mới', icon: './icon-192.png' };
  try { data = { ...data, ...event.data.json() }; } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || './icon-192.png',
      badge: './icon-72.png',
      vibrate: [200, 100, 200],
      tag: 'infosys-notification',
      renotify: true,
      data: { url: data.url || './' }
    })
  );
});

// ---- Notification click: open app ----
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// ---- Background task check (via message from app) ----
self.addEventListener('message', event => {
  if (event.data?.type === 'CHECK_DEADLINES') {
    // App sends deadline data, SW sends notification if needed
    const overdue = event.data.overdue || [];
    const today = event.data.today || [];

    if (overdue.length > 0) {
      self.registration.showNotification('⚠️ Công việc quá hạn', {
        body: `${overdue.length} công việc đã quá hạn: ${overdue.slice(0,2).join(', ')}${overdue.length > 2 ? '...' : ''}`,
        icon: './icon-192.png',
        badge: './icon-72.png',
        vibrate: [300, 100, 300],
        tag: 'overdue-tasks'
      });
    } else if (today.length > 0) {
      self.registration.showNotification('📋 Công việc hôm nay', {
        body: `${today.length} việc cần làm hôm nay`,
        icon: './icon-192.png',
        badge: './icon-72.png',
        tag: 'today-tasks'
      });
    }
  }
});
