(async () => {
  'use strict';

  if (window.location.pathname.includes('dashboard')) {
    try {
      const res  = await fetch('/api/auth/check');
      const data = await res.json();
      if (!data.loggedIn) {
        window.location.href = '/index.html';
        return;
      }
      const user = data.user;
      const nameEl = document.getElementById('userNameDisplay');
      const badgeEl = document.getElementById('roleBadge');
      if (nameEl)  nameEl.textContent  = user.nama;
      if (badgeEl) badgeEl.textContent = user.role;
      window.currentUser = user;
    } catch (e) {
      window.location.href = '/index.html';
    }
  }
})();

window.doLogin = async function () {
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value;

  if (!username) { showFieldError('group-username', 'err-username', 'Username tidak boleh kosong.'); return; }
  if (!password) { showFieldError('group-password', 'err-password', 'Password tidak boleh kosong.'); return; }

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
      alert(data.message || 'Login gagal.');
    }
  } catch (err) {
    alert('Tidak dapat terhubung ke server.');
  }
};

window.doLogout = async function () {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } finally {
    window.location.href = '/index.html';
  }
};

document.getElementById('btnLogout')?.addEventListener('click', window.doLogout);

document.getElementById('password')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') window.doLogin?.();
});
document.getElementById('username')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') window.doLogin?.();
});

const menuAccessRule = {
  pendaftaran: ['admin'],
  jadwal:      ['admin'],
  absensi:     ['admin', 'guru'],
  kesehatan:   ['admin'],
  konseling:   ['admin', 'guru'],
  nilai:       ['admin', 'guru', 'siswa'],
  siswa:       ['admin', 'guru'],
  guru:        ['admin', 'guru']
};

document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.includes('dashboard')) return;

  document.querySelectorAll('.nav-item[data-page]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.dataset.page;

      if (page !== 'home' && menuAccessRule[page] && !menuAccessRule[page].includes(window.currentUser?.role)) {
        alert('Akses Ditolak: Anda tidak memiliki wewenang membuka fitur ini!');
        return;
      }

      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      link.classList.add('active');

      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(`page-${page}`)?.classList.add('active');
    });
  });

  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
  });

  if (window.currentUser) {
    for (const [pageName, allowedRoles] of Object.entries(menuAccessRule)) {
      const menuId = 'nav' + pageName.charAt(0).toUpperCase() + pageName.slice(1);
      const menuElement = document.getElementById(menuId);
      if (menuElement && !allowedRoles.includes(window.currentUser.role)) {
        menuElement.style.display = 'none';
      }
    }
  }
});

function showFieldError(groupId, errId, msg) {
  const g = document.getElementById(groupId);
  const e = document.getElementById(errId);
  if (e) e.textContent = msg;
}
