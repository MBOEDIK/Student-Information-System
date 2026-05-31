(function () {
  'use strict';

  function clearFieldError(groupId, errId) {
    const g = document.getElementById(groupId);
    const e = document.getElementById(errId);
    if (e) e.textContent = '';
    if (g) {
      const input = g.querySelector('.form-input');
      if (input) input.classList.remove('input--error');
    }
  }

  function showFieldError(groupId, errId, msg) {
    const g = document.getElementById(groupId);
    const e = document.getElementById(errId);
    if (e) e.textContent = msg;
    if (g) {
      const input = g.querySelector('.form-input');
      if (input) input.classList.add('input--error');
    }
  }

  function showSuccess(msg) {
    const el = document.getElementById('alertSuccess');
    const txt = document.getElementById('alertSuccessMsg');
    const errEl = document.getElementById('alertError');
    if (errEl) errEl.hidden = true;
    if (txt) txt.textContent = msg;
    if (el) el.hidden = false;
  }

  function showError(msg) {
    const el = document.getElementById('alertError');
    const txt = document.getElementById('alertErrorMsg');
    const sucEl = document.getElementById('alertSuccess');
    if (sucEl) sucEl.hidden = true;
    if (txt) txt.textContent = msg;
    if (el) el.hidden = false;
  }

  function setLoading(on) {
    const btn = document.getElementById('btnSimpan');
    const textEl = document.getElementById('btnSimpanText');
    const loadEl = document.getElementById('btnSimpanLoader');
    if (btn) btn.disabled = on;
    if (textEl) textEl.hidden = on;
    if (loadEl) loadEl.hidden = !on;
  }

  function resetForm() {
    const form = document.getElementById('formPendaftaran');
    if (form) form.reset();
    document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    document.querySelectorAll('.form-input').forEach(e => e.classList.remove('input--error'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formPendaftaran');
    if (!form) return;

    document.getElementById('btnReset')?.addEventListener('click', function (e) {
      e.preventDefault();
      resetForm();
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
      document.querySelectorAll('.form-input').forEach(el => el.classList.remove('input--error'));
      const sucEl = document.getElementById('alertSuccess');
      const errEl = document.getElementById('alertError');
      if (sucEl) sucEl.hidden = true;
      if (errEl) errEl.hidden = true;

      const nis = document.getElementById('nis')?.value.trim();
      const nama = document.getElementById('nama')?.value.trim();
      const jenis_kelamin = document.getElementById('jenis_kelamin')?.value;
      const alamat = document.getElementById('alamat')?.value.trim();

      let hasError = false;

      if (!nis) { showFieldError('group-nis', 'err-nis', 'NIS tidak boleh kosong.'); hasError = true; }
      if (!nama) { showFieldError('group-nama', 'err-nama', 'Nama tidak boleh kosong.'); hasError = true; }
      if (!jenis_kelamin) { showFieldError('group-jenis_kelamin', 'err-jenis_kelamin', 'Jenis Kelamin harus dipilih.'); hasError = true; }
      if (!alamat) { showFieldError('group-alamat', 'err-alamat', 'Alamat tidak boleh kosong.'); hasError = true; }

      if (hasError) return;

      setLoading(true);

      try {
        const res = await fetch('/api/siswa/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nis, nama, jenis_kelamin, alamat })
        });

        const data = await res.json();

        if (data.success) {
          showSuccess(data.message);
          resetForm();
        } else {
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(function (msg) {
              if (msg.toLowerCase().includes('nis')) {
                showFieldError('group-nis', 'err-nis', msg);
              } else if (msg.toLowerCase().includes('nama')) {
                showFieldError('group-nama', 'err-nama', msg);
              } else if (msg.toLowerCase().includes('kelamin')) {
                showFieldError('group-jenis_kelamin', 'err-jenis_kelamin', msg);
              } else if (msg.toLowerCase().includes('alamat')) {
                showFieldError('group-alamat', 'err-alamat', msg);
              }
            });
          }
          showError(data.message || 'Pendaftaran gagal.');
        }
      } catch (err) {
        showError('Tidak dapat terhubung ke server.');
      } finally {
        setLoading(false);
      }
    });
  });
})();
