const CACHE_NAME = 'retena-v7';
const STATIC_ASSETS = [
  '/dashboard/',
  '/dashboard/styles.css',
  '/dashboard/js/shared.js',
  '/dashboard/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Push Notifications ──

self.addEventListener('push', (e) => {
  if (!e.data) return;

  let data = {};
  try { data = e.data.json(); } catch { data = { title: 'Retena', body: e.data.text() }; }

  const { title = 'Retena', body = '', icon = '/dashboard/icons/icon-192.png', badge = '/dashboard/icons/badge-72.png', tag, actions = [], data: notifData = {} } = data;

  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag: tag || 'retena-general',
      renotify: true,
      vibrate: [200, 100, 200],
      actions,           // ← pass action buttons to the notification
      data: notifData,
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  const action = e.action || '';

  e.waitUntil((async () => {
    // Action: "open_wa" → open WhatsApp chat
    // wa.me/PHONE opens the WA app on mobile, WhatsApp Web on desktop
    if (action === 'open_wa' && data.whatsapp_phone) {
      await clients.openWindow(`https://wa.me/${data.whatsapp_phone}`);
      return;
    }

    // Default: open Retena dashboard (use absolute URL — client.navigate requires it)
    const relUrl = data.url || '/dashboard/';
    const targetUrl = relUrl.startsWith('http') ? relUrl : (self.location.origin + relUrl);
    const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    // If a Retena tab is already open, focus + navigate it
    for (const client of windowClients) {
      if (client.url.includes('/dashboard') && 'navigate' in client) {
        await client.focus();
        await client.navigate(targetUrl);
        return;
      }
    }
    // Otherwise open new tab
    if (clients.openWindow) await clients.openWindow(targetUrl);
  })());
});

// ── Fetch: network-first for API, cache-first for static ──
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // API calls: always network
  if (url.pathname.startsWith('/api/')) return;

  // Skip non-http(s) schemes (chrome-extension://, etc.)
  if (!url.protocol.startsWith('http')) return;

  // Static assets: cache-first, then network
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
