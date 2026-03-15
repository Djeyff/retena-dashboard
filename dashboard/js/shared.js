/* Retena Dashboard — Shared JS */

// ── Logo ──
const RT_LOGO = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#1E3A5F"/><text x="14" y="19" text-anchor="middle" fill="white" font-family="DM Sans" font-weight="700" font-size="16">R</text></svg>`;

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
  { id:'search', label:'Search', href:'/dashboard/search.html', icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>` },
  { id:'settings', label:'Settings', href:'/dashboard/settings.html', icon:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>` },
];

const PLAN_LIMITS = {
  starter:  { voice_min: 100, ai_queries: 50,       groups: 5,        seats: 1, storage_gb: 2 },
  pro:      { voice_min: 500, ai_queries: 300,      groups: 15,       seats: 3, storage_gb: 10 },
  business: { voice_min: Infinity, ai_queries: Infinity, groups: Infinity, seats: 5, storage_gb: 50 },
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
      navHtml += `<a class="${cls}" href="${item.href}">${item.icon}<span>${item.label}</span></a>`;
    }
  }

  el.innerHTML = `
    <div class="sidebar-logo">${RT_LOGO}<span>Retena</span></div>
    <nav class="sidebar-nav">${navHtml}</nav>
    <div class="sidebar-bottom">
      <div style="font-size:11px;font-weight:600;color:var(--accent);margin-bottom:8px;padding:0 4px">PRO PLAN</div>
      <div class="sidebar-meters" id="sidebar-meters">
        ${usageMeter('Voice min', '🎙', 0, 500)}
        ${usageMeter('AI queries', '🤖', 0, 300)}
        ${usageMeter('Groups', '👥', 0, 15)}
      </div>
      <a class="sidebar-crosssell" href="https://voz-clara.com" target="_blank">🎤 Personal use → VozClara</a>
    </div>
  `;
}

// ── Render Mobile Tabs ──
function renderMobileTabs(activeId) {
  const el = document.getElementById('mobile-tabs');
  if (!el) return;
  el.innerHTML = RT_MOBILE_TABS.map(t =>
    `<a class="mobile-tab${t.id === activeId ? ' active' : ''}" href="${t.href}">${t.icon}<span>${t.label}</span></a>`
  ).join('');
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
  const el = document.getElementById('sidebar-meters');
  if (!el || !usage) return;
  const plan = PLAN_LIMITS[usage.plan || 'starter'];
  el.innerHTML =
    usageMeter('Voice min', '🎙', usage.voice_minutes || 0, plan.voice_min) +
    usageMeter('AI queries', '🤖', usage.ai_queries || 0, plan.ai_queries) +
    usageMeter('Groups', '👥', usage.groups || 0, plan.groups);
}

// ── API Helper ──
async function api(path, opts = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(path, {
      ...opts,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      credentials: 'include',
    });
    clearTimeout(timeout);
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

// ── Init common ──
document.addEventListener('DOMContentLoaded', () => {
  loadUsage();
});
