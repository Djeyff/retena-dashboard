/* Retena Dashboard — Shared JS */

// ── Auth: Supabase session guard ──
const _SUPA_URL = 'https://mfhdoiddbgpjqjukacnc.supabase.co';
const _SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1maGRvaWRkYmdwanFqdWthY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NjEyNTIsImV4cCI6MjA4ODQzNzI1Mn0.fSL2d0gFjqyFLEPwCrzFI-r49oqCZNJiq4LJS3C0m50';

(async function checkAuth() {
  // Don't guard the login page itself
  if (location.pathname.includes('login.html')) return;

  // Lazy-load Supabase to check session
  await new Promise((resolve, reject) => {
    if (window.supabase) return resolve();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

  const client = window.supabase.createClient(_SUPA_URL, _SUPA_KEY);
  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    location.href = `/dashboard/login.html?next=${encodeURIComponent(location.pathname + location.search)}`;
    return;
  }

  // Proactively refresh if token expires in < 5 minutes (handles mobile/PWA restored tabs)
  const expiresAt = session.expires_at || 0; // unix seconds
  const nowSec = Math.floor(Date.now() / 1000);
  let activeSession = session;
  if (expiresAt - nowSec < 300) {
    const { data: refreshed } = await client.auth.refreshSession();
    if (refreshed?.session) activeSession = refreshed.session;
  }

  // Store JWT for API calls
  window._retenaJWT = activeSession.access_token;
  window._retenaUser = activeSession.user;
  window._supabaseClient = client;
  // Cache account ID for instant display in settings
  if (session.user?.id) localStorage.setItem('retena_account_id', session.user.id);

  // Auto-refresh JWT when token changes (expiry, refresh, etc.)
  client.auth.onAuthStateChange((event, newSession) => {
    if (newSession?.access_token) {
      window._retenaJWT = newSession.access_token;
    } else if (event === 'SIGNED_OUT') {
      window._retenaJWT = null;
      location.href = '/dashboard/login.html';
    }
  });

  // Periodic proactive refresh every 10 min — prevents 401s on mobile/PWA where
  // onAuthStateChange doesn't fire reliably after JS suspension
  setInterval(async () => {
    try {
      const { data } = await client.auth.refreshSession();
      if (data?.session?.access_token) window._retenaJWT = data.session.access_token;
    } catch {}
  }, 10 * 60 * 1000);

  // Also refresh on visibility change (user returns to tab/app after being away)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && client) {
      try {
        const { data } = await client.auth.refreshSession();
        if (data?.session?.access_token) window._retenaJWT = data.session.access_token;
      } catch {}
    }
  });

  // Prefetch personal + groups data (warm cache before user navigates)
  if (activeSession.access_token && !location.pathname.includes('login')) {
    const prefetchHeaders = { 'Authorization': `Bearer ${activeSession.access_token}`, 'Content-Type': 'application/json' };
    const prefetchOpts = { headers: prefetchHeaders, credentials: 'include' };
    // Personal inbox
    fetch('/api/rt/personal', prefetchOpts).then(r => r.ok ? r.json() : null).then(data => {
      if (data?.conversations) {
        try { localStorage.setItem('retena_personal_convos', JSON.stringify({ conversations: data.conversations, ts: Date.now() })); } catch {}
      }
    }).catch(() => {});
    // Groups
    fetch('/api/rt/groups', prefetchOpts).then(r => r.ok ? r.json() : null).then(data => {
      if (data?.items) {
        try { localStorage.setItem('retena_groups_list', JSON.stringify({ items: data.items, ts: Date.now() })); } catch {}
      }
    }).catch(() => {});
  }
})();

// ── PWA: Register service worker + inject manifest ──
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/dashboard/sw.js').catch(() => {});
}
if (!document.querySelector('link[rel="manifest"]')) {
  const m = document.createElement('link');
  m.rel = 'manifest'; m.href = '/dashboard/manifest.json';
  document.head.appendChild(m);
  // iOS meta tags
  const meta = (n, c) => { const t = document.createElement('meta'); t.name = n; t.content = c; document.head.appendChild(t); };
  meta('mobile-web-app-capable', 'yes');
  meta('apple-mobile-web-app-capable', 'yes');
  meta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  meta('theme-color', '#E67E22');
  const icon = document.createElement('link');
  icon.rel = 'apple-touch-icon'; icon.href = '/dashboard/icons/apple-touch-icon.png';
  document.head.appendChild(icon);
  // Favicon
  const fav = document.createElement('link');
  fav.rel = 'icon'; fav.type = 'image/x-icon'; fav.href = '/dashboard/icons/favicon.ico';
  document.head.appendChild(fav);
  const fav32 = document.createElement('link');
  fav32.rel = 'icon'; fav32.type = 'image/png'; fav32.sizes = '32x32'; fav32.href = '/dashboard/icons/icon-32.png';
  document.head.appendChild(fav32);
  const fav16 = document.createElement('link');
  fav16.rel = 'icon'; fav16.type = 'image/png'; fav16.sizes = '16x16'; fav16.href = '/dashboard/icons/icon-16.png';
  document.head.appendChild(fav16);
}

// ── Logo ──
const RT_LOGO = `<svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="rl-iris" cx="40%" cy="35%" r="60%"><stop offset="0%" stop-color="#f5a623"/><stop offset="60%" stop-color="#e67e22"/><stop offset="100%" stop-color="#c0621a"/></radialGradient></defs><path d="M 12 50 Q 50 18 88 50 Q 50 82 12 50 Z" fill="none" stroke="#e67e22" stroke-width="3.5" stroke-linejoin="round"/><circle cx="50" cy="50" r="14" fill="url(#rl-iris)"/><circle cx="50" cy="50" r="6" fill="#0a0a0a"/><path d="M 44 46 Q 42 50 44 54" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="2.2" stroke-linecap="round"/><path d="M 40 43 Q 37 50 40 57" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="55.5" cy="43.5" rx="3" ry="2" fill="rgba(255,255,255,0.28)" transform="rotate(-20,55.5,43.5)"/></svg>`;

// ── Nav Items ──
const RT_NAV = [
  { id:'home', label:'Home', href:'/dashboard/', icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { id:'groups', label:'Groups', href:'/dashboard/groups.html', icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>` },
  { id:'personal', label:'Personal Inbox', href:'/dashboard/personal.html', icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>` },
  { id:'sep1', type:'separator' },
  { id:'search', label:'AI Search', href:'/dashboard/search.html', icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M8 8l2 2m2 0l2-2" opacity="0.5"/></svg>` },
  { id:'summaries', label:'Summaries', href:'/dashboard/summaries.html', icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>` },
  { id:'transcripts', label:'Transcripts', href:'/dashboard/transcripts.html', icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>` },
  { id:'activity', label:'Activity', href:'/dashboard/activity.html', icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
  { id:'sep2', type:'separator' },
  { id:'exports', label:'Exports', href:'/dashboard/exports.html', icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>` },
  { id:'settings', label:'Settings', href:'/dashboard/settings.html', icon:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>` },
];

const RT_MOBILE_TABS = [
  { id:'home', label:'Home', href:'/dashboard/', icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { id:'groups', label:'Groups', href:'/dashboard/groups.html', icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>` },
  { id:'personal', label:'Inbox', href:'/dashboard/personal.html', icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>` },
  { id:'search', label:'Search', href:'/dashboard/search.html', icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` },
  { id:'more', label:'More', href:'#', icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>` },
];

const PLAN_LIMITS = {
  starter:  { voice_min: 100, ai_queries: 50,       groups: 5,        seats: 1, storage_gb: 2 },
  pro:      { voice_min: 500, ai_queries: 300,      groups: 15,       seats: 3, storage_gb: 10 },
  business: { voice_min: 4000, ai_queries: Infinity, groups: Infinity, seats: 5, storage_gb: 50 },
};

// ── Render Sidebar ──
function renderSidebar(activeId) {
  const el = document.getElementById('sidebar');
  if (!el) return;

  let navHtml = '';
  for (const item of RT_NAV) {
    if (item.type === 'separator') {
      navHtml += '<div class="nav-separator"></div>';
    } else {
      const cls = item.id === activeId ? 'nav-item active' : 'nav-item';
      navHtml += `<a class="${cls}" href="${item.href}" onclick="sessionStorage.setItem('retena_nav','1')">${item.icon}<span>${item.label}</span></a>`;
    }
  }

  el.innerHTML = `
    <div class="sidebar-logo">${RT_LOGO}<span>Retena</span><span style="margin-left:auto;display:flex;gap:6px;align-items:center"><span id="rt-ws-dot" title="Connecting…" style="width:8px;height:8px;border-radius:50%;background:#f59e0b;flex-shrink:0;transition:background 0.3s" title="Live push"></span><span id="wa-status-dot" title="Checking…" style="width:8px;height:8px;border-radius:50%;background:#666;flex-shrink:0;transition:background 0.3s"></span></span></div>
    <nav class="sidebar-nav">${navHtml}</nav>
    <div class="sidebar-bottom">
      <div style="font-size:11px;font-weight:600;color:var(--accent);margin-bottom:8px;padding:0 4px">PRO PLAN</div>
      <div class="sidebar-meters" id="sidebar-meters">
        ${usageMeter('Voice min', '🎙', 0, 500)}
        ${usageMeter('AI queries', '🤖', 0, 300)}
        ${usageMeter('Groups', '👥', 0, 15)}
      </div>
      <div style="margin-top:12px;padding-top:8px;border-top:1px solid var(--border);font-size:11px;color:var(--text-muted);display:flex;align-items:center;justify-content:space-between">
        <span id="sidebar-user-email" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px">${window._retenaUser?.email || ''}</span>
        <button onclick="signOut()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:11px;padding:2px 6px;border-radius:4px;transition:.2s" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='var(--text-muted)'">Sign out</button>
      </div>
    </div>
  `;

  // Start WhatsApp status polling
  checkWaStatus();
  setInterval(checkWaStatus, 30000);
}

async function checkWaStatus() {
  const dot = document.getElementById('wa-status-dot');
  if (!dot) return;
  try {
    const r = await api('/api/wa-status');
    dot.style.background = r.connected ? '#22c55e' : '#ef4444';
    dot.title = r.connected ? `WhatsApp connected · ${r.transcriptions || 0} transcriptions` : 'WhatsApp disconnected';
  } catch {
    dot.style.background = '#ef4444';
    dot.title = 'WhatsApp status unknown';
  }
}

// ── Render Mobile Tabs ──
function renderMobileTabs(activeId) {
  const el = document.getElementById('mobile-tabs');
  if (!el) return;

  // Check if current page is one of the "more" pages
  const morePages = ['summaries', 'transcripts', 'activity', 'exports', 'settings'];
  const isMoreActive = morePages.includes(activeId);

  el.innerHTML = RT_MOBILE_TABS.map(t => {
    if (t.id === 'more') {
      return `<a class="mobile-tab${isMoreActive ? ' active' : ''}" href="#" onclick="toggleMobileMenu(event)">${t.icon}<span>${t.label}</span></a>`;
    }
    return `<a class="mobile-tab${t.id === activeId ? ' active' : ''}" href="${t.href}" onclick="sessionStorage.setItem('retena_nav','1')">${t.icon}<span>${t.label}</span></a>`;
  }).join('');

  // Add slide-up drawer for "More" menu
  if (!document.getElementById('mobile-drawer')) {
    const drawer = document.createElement('div');
    drawer.id = 'mobile-drawer';
    drawer.className = 'mobile-drawer';
    drawer.innerHTML = `
      <div class="mobile-drawer-overlay" onclick="closeMobileMenu()"></div>
      <div class="mobile-drawer-panel">
        <div class="mobile-drawer-handle" onclick="closeMobileMenu()"><div class="handle-bar"></div></div>
        <nav class="mobile-drawer-nav">
          ${RT_NAV.filter(n => n.type !== 'separator').map(n =>
            `<a class="mobile-drawer-item${n.id === activeId ? ' active' : ''}" href="${n.href}" onclick="sessionStorage.setItem('retena_nav','1')">
              ${n.icon}<span>${n.label}</span>
            </a>`
          ).join('')}
        </nav>
        <div class="mobile-drawer-footer">
          <div style="font-size:11px;font-weight:600;color:var(--accent);margin-bottom:8px">PRO PLAN</div>
          <div id="mobile-meters" class="sidebar-meters"></div>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
  }
}

function toggleMobileMenu(e) {
  if (e) e.preventDefault();
  const drawer = document.getElementById('mobile-drawer');
  if (drawer) {
    drawer.classList.toggle('open');
    document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
  }
}

function closeMobileMenu() {
  const drawer = document.getElementById('mobile-drawer');
  if (drawer) {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ── Usage Meter ──
function usageMeter(label, emoji, used, total) {
  if (total === Infinity) {
    return `<div class="meter-row"><span>${emoji}</span><span class="meter-label">${label}</span><span class="meter-value">${used} / ∞</span></div>`;
  }
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const color = pct > 80 ? 'red' : pct > 50 ? 'amber' : 'green';
  return `
    <div>
      <div class="meter-row"><span>${emoji}</span><span class="meter-label">${label}</span><span class="meter-value">${used} / ${total}</span></div>
      <div class="meter-bar"><div class="meter-fill ${color}" style="width:${pct}%"></div></div>
    </div>`;
}

// ── Update sidebar meters from usage data ──
function updateSidebarMeters(usage) {
  if (!usage) return;
  const plan = PLAN_LIMITS[usage.plan || 'starter'];
  // API returns {used, limit} objects for voice/ai — extract safely
  const voiceUsed  = usage.voice_minutes?.used  ?? (typeof usage.voice_minutes  === 'number' ? usage.voice_minutes  : 0);
  const voiceLimit = usage.voice_minutes?.limit ?? plan.voice_min;
  const aiUsed     = usage.ai_queries?.used     ?? (typeof usage.ai_queries     === 'number' ? usage.ai_queries     : 0);
  const aiLimit    = usage.ai_queries?.limit    ?? plan.ai_queries;
  const html =
    usageMeter('Voice min', '🎙', voiceUsed, voiceLimit) +
    usageMeter('AI queries', '🤖', aiUsed, aiLimit) +
    usageMeter('Groups', '👥', usage.groups || 0, plan.groups);
  // Update both sidebar and mobile drawer
  const el = document.getElementById('sidebar-meters');
  if (el) el.innerHTML = html;
  const mobileEl = document.getElementById('mobile-meters');
  if (mobileEl) mobileEl.innerHTML = html;
}

// ── API Helper ──
// Debounced 401 refresh — prevents multiple concurrent API calls from all refreshing at once
let _refreshPromise = null;
async function _refreshToken() {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    try {
      const { data } = await window._supabaseClient.auth.refreshSession();
      if (data?.session?.access_token) {
        window._retenaJWT = data.session.access_token;
        return true;
      }
    } catch {} finally { _refreshPromise = null; }
    return false;
  })();
  return _refreshPromise;
}

async function api(path, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const authHeader = window._retenaJWT ? { 'Authorization': `Bearer ${window._retenaJWT}` } : {};
    const res = await fetch(path, {
      ...opts,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...authHeader, ...(opts.headers || {}) },
      credentials: 'include',
    });
    clearTimeout(timeout);

    // On 401: debounced refresh + retry
    if (res.status === 401 && window._supabaseClient) {
      const refreshed = await _refreshToken();
      if (refreshed) {
        const retryRes = await fetch(path, {
          ...opts,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window._retenaJWT}`, ...(opts.headers || {}) },
          credentials: 'include',
        });
        if (retryRes.ok) return await retryRes.json();
        throw new Error(`HTTP ${retryRes.status} after token refresh`);
      }
      // If refresh failed, redirect to login
      location.href = `/dashboard/login.html?next=${encodeURIComponent(location.pathname + location.search)}`;
      throw new Error('Session expired — redirecting to login');
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === 'AbortError') throw new Error('Request timed out');
    throw e;
  }
}

// ── Utilities ──
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function esc(s) {
  if (!s) return '';
  const div = document.createElement('div');
  div.textContent = String(s);
  return div.innerHTML;
}

function truncate(s, len = 100) {
  if (!s) return '';
  return s.length > len ? s.slice(0, len) + '…' : s;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  const weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  if (diff < 604800) return weekday;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name) {
  if (!name) return '?';
  return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name) {
  if (!name) return '#5a6475';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['#E67E22','#27AE60','#2A5C8F','#8e44ad','#c0392b','#16a085','#d35400','#2980b9'];
  return colors[Math.abs(hash) % colors.length];
}

function renderAvatar(name, size = '') {
  const cls = size ? `avatar avatar-${size}` : 'avatar';
  return `<div class="${cls}" style="background:${avatarColor(name)}">${initials(name)}</div>`;
}

function groupPill(name) {
  return `<span class="pill pill-group">${name}</span>`;
}

function personalPill() {
  return `<span class="pill pill-personal">Personal</span>`;
}

function truncate(str, len = 120) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function showLoading(el) {
  if (!el) return;
  el.innerHTML = `
    <div style="padding:24px">
      <div class="skeleton-line w-80"></div>
      <div class="skeleton-line w-60"></div>
      <div class="skeleton-line w-40"></div>
      <div class="skeleton-line w-80" style="margin-top:20px"></div>
      <div class="skeleton-line w-60"></div>
    </div>`;
}

function showError(el, msg) {
  if (!el) return;
  el.innerHTML = `<div class="error-state"><p>${msg || 'Something went wrong. Try refreshing.'}</p><button class="btn btn-secondary" onclick="location.reload()">Refresh</button></div>`;
}

function showEmpty(el, title, desc, cta) {
  if (!el) return;
  el.innerHTML = `<div class="empty-state"><h3>${title}</h3><p>${desc}</p>${cta ? `<a class="btn btn-primary" href="${cta.href || '#'}">${cta.label}</a>` : ''}</div>`;
}

// ── Collapsible sections ──
function toggleCollapsible(headerId) {
  const header = document.getElementById(headerId);
  if (!header) return;
  const body = header.nextElementSibling;
  header.classList.toggle('open');
  body.classList.toggle('open');
}

// ── Modal ──
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// ── Load usage for sidebar ──
async function loadUsage() {
  try {
    const data = await api('/api/rt/usage');
    if (data) updateSidebarMeters(data);
  } catch (e) { /* silent */ }
}

// ── Realtime Push (Supabase WebSocket) ───────────────────────────────────────
// Pages register handlers via: window.addEventListener('retena:newData', e => { ... e.detail ... })
// e.detail = { items: [...], since: ISO, hasNew: bool }
// Falls back to 30s polling if WebSocket fails / isn't supported.
// ---

window._retenaLastSeen = null;
let _pollTimer = null;
let _realtimeConnected = false;

function _emitNewData(items, hasNew = true) {
  if (!items?.length) return;
  const newest = items.reduce((max, m) => {
    const ts = m.timestamp || m.created_at || '';
    return ts > max ? ts : max;
  }, window._retenaLastSeen || '');
  if (newest) window._retenaLastSeen = newest;
  window.dispatchEvent(new CustomEvent('retena:newData', {
    detail: { items, hasNew },
  }));
  loadUsage().catch(() => {}); // refresh sidebar meters
}

// ── Supabase Realtime (WebSocket push) ──
function startRealtimePush() {
  // Lazy-load Supabase JS from CDN
  if (window.__supabaseLoaded) { _subscribeRealtime(); return; }
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
  script.onload = () => { window.__supabaseLoaded = true; _subscribeRealtime(); };
  script.onerror = () => { console.warn('[retena] Supabase CDN failed — falling back to polling'); _startFallbackPoll(); };
  document.head.appendChild(script);
}

function _subscribeRealtime() {
  try {
    const client = window.supabase.createClient(_SUPA_URL, _SUPA_KEY);
    const channel = client
      .channel('retena_messages_push')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'retena_messages' },
        (payload) => {
          if (!payload?.new) return;
          _emitNewData([payload.new], !!window._retenaLastSeen);
          _updateWsIndicator(true);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'retena_messages' },
        (payload) => {
          // Transcription arrived for an existing voice note
          if (payload?.new?.transcription && !payload?.old?.transcription) {
            window.dispatchEvent(new CustomEvent('retena:transcribed', { detail: payload.new }));
          }
        }
      )
      .subscribe((status) => {
        _realtimeConnected = status === 'SUBSCRIBED';
        _updateWsIndicator(_realtimeConnected);
        if (status === 'SUBSCRIBED') {
          console.log('[retena] 🟢 Realtime push connected');
          // Catch up on anything missed during page load
          _catchUp();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[retena] Realtime error — switching to poll fallback');
          _startFallbackPoll();
        }
      });

    // Reconnect on tab focus if WS dropped
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !_realtimeConnected) {
        _catchUp();
      }
    });
  } catch (e) {
    console.warn('[retena] Realtime setup failed:', e.message);
    _startFallbackPoll();
  }
}

// ── Catch-up: fetch anything missed while tab was hidden or during load ──
async function _catchUp() {
  try {
    const since = window._retenaLastSeen;
    const url = since
      ? `/api/rt/activity?limit=30&since=${encodeURIComponent(since)}`
      : `/api/rt/activity?limit=5`; // first load — just set cursor, don't emit
    const data = await api(url);
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    if (since && items.length) _emitNewData(items, true);
    else if (!since && items.length) {
      // Set initial cursor without triggering UI update
      const newest = items.reduce((max, m) => { const ts = m.timestamp || m.created_at || ''; return ts > max ? ts : max; }, '');
      if (newest) window._retenaLastSeen = newest;
    }
  } catch (e) { /* silent */ }
}

// ── Fallback: 30s poll if WebSocket unavailable ──
async function _pollOnce() {
  try {
    const since = window._retenaLastSeen;
    if (!since) { await _catchUp(); return; }
    const data = await api(`/api/rt/activity?limit=20&since=${encodeURIComponent(since)}`);
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    if (items.length) _emitNewData(items, true);
    loadUsage().catch(() => {});
  } catch (e) { /* silent */ }
}

function _startFallbackPoll() {
  if (_pollTimer) return;
  _pollOnce();
  _pollTimer = setInterval(_pollOnce, 30000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') _pollOnce();
  });
}

// ── WS status dot update ── (reuses the existing wa-status-dot logic)
function _updateWsIndicator(connected) {
  const dot = document.getElementById('rt-ws-dot');
  if (dot) {
    dot.title = connected ? 'Live updates active' : 'Reconnecting…';
    dot.style.background = connected ? '#8b5cf6' : '#f59e0b'; // purple=live, amber=reconnecting
  }
}

// ── New-message badge helper ──────────────────────────────────────────────────
// Call showNewMsgBadge(count, onClick) to show a "↓ N new" pill.
// onClick is called when user taps it (typically scrolls to bottom).
function showNewMsgBadge(container, count, onClick) {
  let badge = container.querySelector('.rt-new-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'rt-new-badge';
    badge.style.cssText = [
      'position:sticky', 'bottom:16px', 'left:50%', 'transform:translateX(-50%)',
      'display:inline-flex', 'align-items:center', 'gap:6px',
      'background:var(--accent)', 'color:#fff',
      'font-size:12px', 'font-weight:600',
      'padding:6px 14px', 'border-radius:999px',
      'cursor:pointer', 'z-index:10', 'box-shadow:0 2px 8px rgba(0,0,0,.3)',
      'transition:opacity .2s', 'width:fit-content', 'margin:0 auto',
    ].join(';');
    container.appendChild(badge);
  }
  badge.textContent = `↓ ${count} new`;
  badge.style.opacity = '1';
  badge.onclick = () => {
    badge.style.opacity = '0';
    setTimeout(() => badge.remove(), 200);
    if (onClick) onClick();
  };
}

// ── Sign Out ──
async function signOut() {
  try {
    if (window.supabase) {
      const client = window.supabase.createClient(_SUPA_URL, _SUPA_KEY);
      await client.auth.signOut();
    }
  } catch {}
  window._retenaJWT = null;
  window._retenaUser = null;
  location.href = '/dashboard/login.html';
}

// ── openWA — universal WhatsApp deep link (Brave mobile/desktop, Android Chrome, iOS Safari) ──
// Brave check must come FIRST — Brave Android would otherwise fall into intent://, which Brave
// intercepts differently. Hidden anchor click is the most reliable method across all Brave versions.
function openWA(phone) {
  const clean = phone.replace(/[^\d]/g, '');
  const isBrave   = typeof navigator.brave !== 'undefined';
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS     = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const scheme = isAndroid
    ? `intent://send/${clean}#Intent;scheme=whatsapp;package=com.whatsapp;end`
    : `whatsapp://send?phone=${clean}`;

  if (isBrave || isAndroid || isIOS) {
    // Hidden anchor click: works in Brave (all), Chrome Android, Safari iOS
    const a = document.createElement('a');
    a.href = scheme;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 500);
  } else {
    window.open(`https://wa.me/${clean}`, '_blank');
  }
}

// ── Init common ──
document.addEventListener('DOMContentLoaded', () => {
  loadUsage();
  startRealtimePush(); // WebSocket push; falls back to 30s poll if unavailable
});
