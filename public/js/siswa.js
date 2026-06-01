'use strict';

window.loadSiswa = async function () {
  const tbody = document.getElementById('siswaTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Memuat data...</td></tr>';
  try {
    const res = await fetch('/api/siswa');
    const json = await res.json();
    if (!json.success || !json.data.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Belum ada data siswa.</td></tr>';
      return;
    }
    tbody.innerHTML = json.data.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${s.nis}</strong></td>
        <td>${s.nama}</td>
        <td>${s.jenis_kelamin}</td>
        <td>${s.alamat || '–'}</td>
        <td>${window.statusBadge(s.status)}</td>
        <td><button class="btn btn--sm btn--primary" onclick="editSiswa(${s.id})">Edit</button></td>
      </tr>
    `).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger);">Gagal memuat data.</td></tr>';
  }
};

window.editSiswa = async function (id) {
  try {
    const res = await fetch(`/api/siswa/${id}`);
    const json = await res.json();
    const s = json.data;
    document.getElementById('edit-siswa-id').value = s.id;
    document.getElementById('edit-siswa-nama').value = s.nama;
    document.getElementById('edit-siswa-nis').value = s.nis;
    document.getElementById('edit-siswa-jenis_kelamin').value = s.jenis_kelamin;
    document.getElementById('edit-siswa-alamat').value = s.alamat;
    document.getElementById('edit-siswa-status').value = s.status;
    window.openModal('modal-siswa');
  } catch (e) {
    alert('Gagal memuat data siswa.');
  }
};

window.simpanSiswa = async function () {
  const id = document.getElementById('edit-siswa-id').value;
  const body = {
    nama: document.getElementById('edit-siswa-nama').value,
    nis: document.getElementById('edit-siswa-nis').value,
    jenis_kelamin: document.getElementById('edit-siswa-jenis_kelamin').value,
    alamat: document.getElementById('edit-siswa-alamat').value,
    status: document.getElementById('edit-siswa-status').value
  };
  try {
    const res = await fetch(`/api/siswa/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await res.json();
    alert(result.message);
    window.closeModal('modal-siswa');
    window.loadSiswa();
  } catch (e) {
    alert('Gagal menyimpan data siswa.');
  }
};

window.cariSiswa = async function (keyword) {
  if (!keyword || !keyword.trim()) return;
  try {
    const res = await fetch(`/api/siswa/search?keyword=${encodeURIComponent(keyword)}`);
    const json = await res.json();
    const tbody = document.getElementById('siswaTableBody');
    if (!tbody) return;
    if (!json.success || json.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px;">Data siswa tidak ditemukan.</td></tr>';
      return;
    }
    tbody.innerHTML = json.data.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${s.nis}</strong></td>
        <td>${s.nama}</td>
        <td>${s.jenis_kelamin}</td>
        <td>${s.alamat || '–'}</td>
        <td>${window.statusBadge(s.status)}</td>
        <td><button class="btn btn--sm btn--primary" onclick="editSiswa(${s.id})">Edit</button></td>
      </tr>
    `).join('');
  } catch (e) {
    alert('Gagal mencari data siswa.');
  }
};

window.page_siswa_init = function () {
  document.getElementById('formCariSiswa')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const keyword = document.getElementById('inputCariSiswa').value.trim();
    if (!keyword) {
      window.loadSiswa();
      return;
    }
    window.cariSiswa(keyword);
  });
  window.loadSiswa();
};

window.page_pendaftaran_init = function () {
  function pendaftaranClearFieldError(groupId, errId) {
    const g = document.getElementById(groupId);
    const e = document.getElementById(errId);
    if (e) e.textContent = '';
    if (g) {
      const input = g.querySelector('.form-input');
      if (input) input.classList.remove('input--error');
    }
  }

  function pendaftaranShowFieldError(groupId, errId, msg) {
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

  function setPendaftaranLoading(on) {
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

  const form = document.getElementById('formPendaftaran');
  if (!form) return;

  document.getElementById('btnReset')?.addEventListener('click', function (e) {
    e.preventDefault();
    resetForm();
  });

  form.querySelectorAll('input, textarea, select').forEach(function (el) {
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        form.requestSubmit();
      }
    });
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

    if (!nis) { pendaftaranShowFieldError('group-nis', 'err-nis', 'NIS tidak boleh kosong.'); hasError = true; }
    if (!nama) { pendaftaranShowFieldError('group-nama', 'err-nama', 'Nama tidak boleh kosong.'); hasError = true; }
    if (!jenis_kelamin) { pendaftaranShowFieldError('group-jenis_kelamin', 'err-jenis_kelamin', 'Jenis Kelamin harus dipilih.'); hasError = true; }
    if (!alamat) { pendaftaranShowFieldError('group-alamat', 'err-alamat', 'Alamat tidak boleh kosong.'); hasError = true; }

    if (hasError) return;

    setPendaftaranLoading(true);

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
              pendaftaranShowFieldError('group-nis', 'err-nis', msg);
            } else if (msg.toLowerCase().includes('nama')) {
              pendaftaranShowFieldError('group-nama', 'err-nama', msg);
            } else if (msg.toLowerCase().includes('kelamin')) {
              pendaftaranShowFieldError('group-jenis_kelamin', 'err-jenis_kelamin', msg);
            } else if (msg.toLowerCase().includes('alamat')) {
              pendaftaranShowFieldError('group-alamat', 'err-alamat', msg);
            }
          });
        }
        showError(data.message || 'Pendaftaran gagal.');
      }
    } catch (err) {
      showError('Tidak dapat terhubung ke server.');
    } finally {
      setPendaftaranLoading(false);
    }
  });
};
