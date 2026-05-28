// Cek login saat masuk dashboard
if (window.location.pathname.includes('dashboard')) {
  fetch('/api/auth/check')
    .then(res => { if (!res.ok) window.location.href = '/'; });
}

// Handle form login
const formLogin = document.getElementById('form-login');
if (formLogin) {
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      window.location.href = data.redirect;
    } else {
      const pesan = document.getElementById('pesan-error');
      pesan.textContent = data.error;
      pesan.style.display = 'block';
    }
  });
}

// Fungsi logout
function logout() {
  fetch('/api/auth/logout', { method: 'POST' })
    .then(() => window.location.href = '/');
}