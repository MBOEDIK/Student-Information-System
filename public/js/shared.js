'use strict';

window.statusBadge = function (status) {
  const map = {
    aktif: 'badge--green',
    lulus: 'badge--gray',
    keluar: 'badge--red',
    'tidak aktif': 'badge--red'
  };
  return `<span class="badge ${map[status] || 'badge--gray'}">${status}</span>`;
};

window.openModal = function (id) {
  const m = document.getElementById(id);
  if (m) m.hidden = false;
};

window.closeModal = function (id) {
  const m = document.getElementById(id);
  if (m) m.hidden = true;
};

window.dismissAlert = function () {
  const el = document.getElementById('flashAlert');
  if (el) el.hidden = true;
};

window.setText = function (id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '–';
};

window.showAlert = function (msg) {
  const el = document.getElementById('flashAlert');
  const txt = document.getElementById('flashMsg');
  if (!el || !txt) return;
  txt.textContent = msg;
  el.hidden = false;
};

window.hideAlert = function () {
  const el = document.getElementById('flashAlert');
  if (el) el.hidden = true;
};

window.showFieldError = function (groupId, errId, msg) {
  const g = document.getElementById(groupId);
  const e = document.getElementById(errId);
  if (e) e.textContent = msg;
  g?.querySelector('.form-input')?.classList.add('input--error');
};

window.clearFieldError = function (groupId, errId) {
  const g = document.getElementById(groupId);
  const e = document.getElementById(errId);
  if (e) e.textContent = '';
  g?.querySelector('.form-input')?.classList.remove('input--error');
};

window.setLoading = function (on) {
  const btn = document.getElementById('btnLogin');
  if (!btn) return;
  const textEl = btn.querySelector('.btn-login__text');
  const loadEl = btn.querySelector('.btn-login__loader');
  const arrEl = btn.querySelector('.btn-login__arrow');
  btn.disabled = on;
  if (textEl) textEl.hidden = on;
  if (loadEl) loadEl.hidden = !on;
  if (arrEl) arrEl.hidden = on;
};

window.api = async function (url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request gagal.');
  return data;
};
