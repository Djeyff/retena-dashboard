/* Retena Dashboard — shared.js (v2 clean build) */

const SB_URL = 'https://mfhdoiddbgpjqjukacnc.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1maGRvaWRkYmdwanFqdWthY25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NjEyNTIsImV4cCI6MjA4ODQzNzI1Mn0.fSL2d0gFjqyFLEPwCrzFI-r49oqCZNJiq4LJS3C0m50';

let sb = null;
let CURRENT_USER = null;

function getSB() {
  if (!sb && window.supabase) sb = window.supabase.createClient(SB_URL, SB_KEY);
  return sb;
}

// ── Auth ──

async function initAuth() {
  const client = getSB();
  if (!client) { location.href = '/dashboard/login.html'; return false; }
  const { data: { session } } = await client.auth.getSession();
  if (!session) { location.href = '/dashboard/login.html'; return false; }
  CURRENT_USER = {
    id: session.user.id,
    email: session.user.email,
    phone: session.user.phone,
    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || session.user.phone || 'User',
    token: session.access_token,
  };
  // Update user display
  document.querySelectorAll('.user-name').forEach(el => el.textContent = CURRENT_USER.name);
  document.querySelectorAll('.user-email').forEach(el => el.textContent = CURRENT_USER.email || CURRENT_USER.phone || '');
  return true;
}

async function signOut() {
  const client = getSB();
  if (client) await client.auth.signOut();
  location.href = '/dashboard/login.html';
}

// ── API helper ──

async function api(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (CURRENT_USER?.token) headers['Authorization'] = `Bearer ${CURRENT_USER.token}`;
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { ...headers, ...options.headers },
    });
    clearTimeout(timeout);
    if (res.status === 401) { location.href = '/dashboard/login.html'; return null; }
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// ── UI helpers ──

function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDuration(sec) {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function langFlag(lang) {
  const f = { en:'🇬🇧', es:'🇪🇸', fr:'🇫🇷', pt:'🇧🇷', de:'🇩🇪', it:'🇮🇹', ar:'🇸🇦' };
  return f[(lang||'').toLowerCase().slice(0,2)] || '🌐';
}

function groupIcon(name) {
  const n = (name||'').toLowerCase();
  if (n.includes('sport')||n.includes('club')) return '⚽';
  if (n.includes('pala')) return '🏗️';
  if (n.includes('coral')||n.includes('obra')) return '🔨';
  return '👥';
}

function showLoading(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '<div style="text-align:center;padding:40px;color:#888"><div class="spinner"></div></div>';
}

function showEmpty(id, icon, text) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#666"><div style="font-size:40px;margin-bottom:12px">${icon}</div><p>${esc(text)}</p></div>`;
}

// ── Navigation ──

const NAV_ITEMS = [
  { id:'home', label:'Home', icon:'🏠', href:'/dashboard/' },
  { id:'groups', label:'Groups', icon:'👥', href:'/dashboard/groups.html' },
  { id:'personal', label:'Personal', icon:'📥', href:'/dashboard/personal.html' },
  { id:'search', label:'Search', icon:'🔍', href:'/dashboard/search.html' },
  { id:'activity', label:'Activity', icon:'📋', href:'/dashboard/activity.html' },
  { id:'settings', label:'Settings', icon:'⚙️', href:'/dashboard/settings.html' },
];

function renderNav(activePage) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="logo-mark">R</div>
      <span class="brand-text">Retena</span>
    </div>
    <nav class="nav">
      ${NAV_ITEMS.map(item => `
        <a class="nav-item ${item.id===activePage?'active':''}" href="${item.href}">
          <span class="nav-icon">${item.icon}</span> ${item.label}
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <span class="user-name"></span>
        <a href="#" onclick="signOut();return false" style="font-size:12px;color:#888">Sign out</a>
      </div>
    </div>
  `;

  // Mobile tabs
  const tabs = document.getElementById('mobile-tabs');
  if (tabs) {
    const mobileTabs = NAV_ITEMS.slice(0, 4);
    tabs.innerHTML = mobileTabs.map(item => `
      <a class="mob-tab ${item.id===activePage?'active':''}" href="${item.href}">
        <span>${item.icon}</span><span class="mob-label">${item.label}</span>
      </a>
    `).join('');
  }
}
