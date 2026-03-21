const CACHE_NAME = 'retena-v15';
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

  const {
    title = 'Retena',
    body = '',
    icon = '/dashboard/icons/icon-192.png',
    badge = '/dashboard/icons/badge-72.png',
    tag,
    data: notifData = {},
  } = data;

  // Always provide Reply + View buttons for voice transcription notifications
  const isVoice = notifData?.type === 'voice_transcribed';
  const actions = isVoice ? [
    { action: 'view_chat', title: '💬 View' },
    ...(notifData?.whatsapp_phone ? [{ action: 'open_wa', title: '↩️ Reply' }] : []),
  ] : (data.actions || []);

  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag: tag || 'retena-general',
      renotify: true,
      vibrate: [200, 100, 200],
      actions,
      data: notifData,
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const notifData = e.notification.data || {};
  const action = e.action || '';

  e.waitUntil((async () => {
    // "Reply in WhatsApp" action
    if (action === 'open_wa' && notifData.whatsapp_phone) {
      await clients.openWindow(`https://wa.me/${notifData.whatsapp_phone}`);
      return;
    }

    // "View chat" action OR default tap → open the specific chat
    const relUrl = notifData.url || '/dashboard/';
    const targetUrl = relUrl.startsWith('http')
      ? relUrl
      : (self.location.origin + relUrl);

    const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    // If a Retena tab is already open, navigate it to the specific chat
    for (const client of windowClients) {
      if (client.url.includes(self.location.origin) && 'navigate' in client) {
        await client.focus();
        await client.navigate(targetUrl);
        return;
      }
    }
    // No tab open → open a new one at the specific chat URL
    if (clients.openWindow) await clients.openWindow(targetUrl);
  })());
});

// ── Fetch: network-first for JS/HTML, cache-fallback for static assets ──
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // API calls: always network (no SW interception)
  if (url.pathname.startsWith('/api/')) return;

  // Skip non-http(s) schemes (chrome-extension://, etc.)
  if (!url.protocol.startsWith('http')) return;

  // JS and HTML files: NETWORK-FIRST (always get latest, cache as fallback)
  // This prevents stale auth/logic code from being served after deploys
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Other static assets (CSS, images, fonts): cache-first, update in background
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
