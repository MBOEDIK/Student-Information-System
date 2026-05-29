// public/js/auth.js
// Menangani login, logout, dan proteksi halaman via fetch API

'use strict';

// ── Proteksi halaman dashboard ────────────────────────────────
// Jika file ini dimuat di dashboard.html, cek session dulu
if (window.location.pathname.includes('dashboard')) {
  (async () => {
    try {
      const res  = await fetch('/api/auth/check');
      const data = await res.json();
      if (!data.loggedIn) {
        window.location.href = '/index.html';
        return;
      }
      // Tampilkan info user di topbar
      const user = data.user;
      const nameEl = document.getElementById('userNameDisplay');
      const badgeEl = document.getElementById('roleBadge');
      if (nameEl)  nameEl.textContent  = user.nama;
      if (badgeEl) badgeEl.textContent = user.role;

      // Simpan di window untuk dipakai modul lain
      window.currentUser = user;

      // Tampilkan tombol tambah/edit/hapus hanya untuk admin
      if (user.role === 'admin') {
        document.querySelectorAll('[id^="btnTambah"]').forEach(el => el.hidden = false);
      }
    } catch (e) {
      window.location.href = '/index.html';
    }
  })();
}

// ── Login (dipanggil dari index.html) ────────────────────────
window.doLogin = async function () {
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value;

  // Bersihkan error lama
  clearFieldError('group-username', 'err-username');
  clearFieldError('group-password', 'err-password');
  hideAlert();

  // Validasi sisi klien
  if (!username) { showFieldError('group-username', 'err-username', 'Username tidak boleh kosong.'); return; }
  if (!password) { showFieldError('group-password', 'err-password', 'Password tidak boleh kosong.'); return; }

  setLoading(true);

  try {
    const res  = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      window.location.href = '/dashboard.html';
    } else {
      showAlert(data.message || 'Login gagal.');
      setLoading(false);
    }
  } catch (err) {
    showAlert('Tidak dapat terhubung ke server.');
    setLoading(false);
  }
};

// ── Logout ────────────────────────────────────────────────────
window.doLogout = async function () {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } finally {
    window.location.href = '/index.html';
  }
};


// Enter key di field password
document.getElementById('password')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') window.doLogin?.();
});
document.getElementById('username')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') window.doLogin?.();
});

// ── Toggle password visibility ────────────────────────────────
window.togglePassword = function () {
  const input = document.getElementById('password');
  const icon  = document.getElementById('eyeIcon');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  icon.className = input.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
};

// ── Sidebar toggle (mobile) ───────────────────────────────────
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar')?.classList.toggle('open');
});

// ── SPA: navigasi antar page ──────────────────────────────────
document.querySelectorAll('.nav-item[data-page]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;

    // Aktifkan nav item
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    link.classList.add('active');

    // Tampilkan page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    // Trigger load data
    if (page === 'siswa')  window.loadSiswa?.();
    if (page === 'guru')   window.loadGuru?.();
    if (page === 'home')   window.loadStats?.();
  });
});

// ── Load stats dashboard ──────────────────────────────────────
window.loadStats = async function () {
  try {
    const [rSiswa, rGuru] = await Promise.all([
      fetch('/api/siswa/stats').then(r => r.json()),
      fetch('/api/guru/stats').then(r => r.json())
    ]);
    if (rSiswa.success) {
      setText('statTotalSiswa', rSiswa.data.total);
      setText('statAktifSiswa', rSiswa.data.aktif);
    }
    if (rGuru.success) {
      setText('statTotalGuru', rGuru.data.total);
      setText('statAktifGuru', rGuru.data.aktif);
    }
  } catch (e) { console.error('Stats error', e); }
};

// Load stats saat dashboard pertama buka
if (window.location.pathname.includes('dashboard')) {
  window.addEventListener('load', () => setTimeout(window.loadStats, 300));
}

// ── Modal helpers ─────────────────────────────────────────────
window.openModal  = (id) => { const m = document.getElementById(id); if(m) m.hidden = false; };
window.closeModal = (id) => { const m = document.getElementById(id); if(m) m.hidden = true; };

// ── Utilities ─────────────────────────────────────────────────
function setText(id, val) { const el = document.getElementById(id); if(el) el.textContent = val ?? '–'; }

function showAlert(msg) {
  const el  = document.getElementById('flashAlert');
  const txt = document.getElementById('flashMsg');
  if (!el || !txt) return;
  txt.textContent = msg;
  el.hidden = false;
}
function hideAlert() {
  const el = document.getElementById('flashAlert');
  if (el) el.hidden = true;
}
window.dismissAlert = () => hideAlert();

function showFieldError(groupId, errId, msg) {
  const g = document.getElementById(groupId);
  const e = document.getElementById(errId);
  if (e) e.textContent = msg;
  g?.querySelector('.form-input')?.classList.add('input--error');
}
function clearFieldError(groupId, errId) {
  const g = document.getElementById(groupId);
  const e = document.getElementById(errId);
  if (e) e.textContent = '';
  g?.querySelector('.form-input')?.classList.remove('input--error');
}

function setLoading(on) {
  const btn    = document.getElementById('btnLogin');
  if (!btn) return;
  const textEl = btn.querySelector('.btn-login__text');
  const loadEl = btn.querySelector('.btn-login__loader');
  const arrEl  = btn.querySelector('.btn-login__arrow');
  btn.disabled  = on;
  if (textEl) textEl.hidden = on;
  if (loadEl) loadEl.hidden = !on;
  if (arrEl)  arrEl.hidden  = on;
}

// ── Badge helper (dipakai siswa.js & guru.js) ─────────────────
window.statusBadge = function (status) {
  const map = {
    'aktif': 'badge--green',
    'lulus': 'badge--gray',
    'keluar':'badge--red',
    'tidak aktif':'badge--red'
  };
  return `<span class="badge ${map[status] || 'badge--gray'}">${status}</span>`;
};

// ── API helper ────────────────────────────────────────────────
window.api = async function (url, options = {}) {
  const res  = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request gagal.');
  return data;
};
