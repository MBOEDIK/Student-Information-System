'use strict';

if (window.location.pathname.includes('dashboard')) {
  (async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (!data.loggedIn) {
        window.location.href = '/index.html';
        return;
      }

      const user = data.user;
      const nameEl = document.getElementById('userNameDisplay');
      const badgeEl = document.getElementById('roleBadge');
      if (nameEl) nameEl.textContent = user.nama || user.nama_lengkap;
      if (badgeEl) badgeEl.textContent = user.role;

      window.currentUser = user;

      for (const [pageName, allowedRoles] of Object.entries(menuAccessRule)) {
        const menuId = 'nav' + pageName.charAt(0).toUpperCase() + pageName.slice(1);
        const menuElement = document.getElementById(menuId);
        if (menuElement && !allowedRoles.includes(user.role)) {
          menuElement.style.display = 'none';
        }
      }

      if (user.role === 'admin') {
        document.querySelectorAll('[id^="btnTambah"]').forEach(el => el.hidden = false);
      }

      router.init();
    } catch (e) {
      window.location.href = '/index.html';
    }
  })();
}

window.doLogin = async function () {
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value;

  clearFieldError('group-username', 'err-username');
  clearFieldError('group-password', 'err-password');
  hideAlert();

  if (!username) { showFieldError('group-username', 'err-username', 'Username tidak boleh kosong.'); return; }
  if (!password) { showFieldError('group-password', 'err-password', 'Password tidak boleh kosong.'); return; }

  setLoading(true);

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
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

window.togglePassword = function () {
  const input = document.getElementById('password');
  const icon = document.getElementById('eyeIcon');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  icon.className = input.type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
};