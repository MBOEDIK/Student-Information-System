'use strict';

window.loadSiswa = async function () {
  const tbody = document.getElementById('siswaTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Memuat data...</td></tr>';
  try {
    const res = await fetch('/api/siswa');
    const json = await res.json();
    if (!json.success || !json.data.length) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center text-muted">Belum ada data siswa.</td></tr>';
      return;
    }
    tbody.innerHTML = json.data
      .map(
        (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${s.nis}</strong></td>
        <td>${s.nama}</td>
        <td>${s.jenis_kelamin}</td>
        <td>${s.alamat || '–'}</td>
        <td>${window.statusBadge(s.status)}</td>
        <td><button class="btn btn--sm btn--primary" onclick="editSiswa(${s.id})">Edit</button></td>
      </tr>
    `
      )
      .join('');
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center text-danger">Gagal memuat data.</td></tr>';
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
      tbody.innerHTML =
        '<tr><td colspan="7" class="text-center text-muted" style="padding:32px;">Data siswa tidak ditemukan.</td></tr>';
      return;
    }
    tbody.innerHTML = json.data
      .map(
        (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${s.nis}</strong></td>
        <td>${s.nama}</td>
        <td>${s.jenis_kelamin}</td>
        <td>${s.alamat || '–'}</td>
        <td>${window.statusBadge(s.status)}</td>
        <td><button class="btn btn--sm btn--primary" onclick="editSiswa(${s.id})">Edit</button></td>
      </tr>
    `
      )
      .join('');
  } catch (e) {
    alert('Gagal mencari data siswa.');
  }
};

window.showSiswaAlert = function (msg, type) {
  const sucEl = document.getElementById('alertSuccess');
  const errEl = document.getElementById('alertError');
  const txt = document.getElementById(type === 'error' ? 'alertErrorMsg' : 'alertSuccessMsg');
  if (type === 'error') {
    if (sucEl) sucEl.hidden = true;
    if (txt) txt.textContent = msg;
    if (errEl) errEl.hidden = false;
  } else {
    if (errEl) errEl.hidden = true;
    if (txt) txt.textContent = msg;
    if (sucEl) sucEl.hidden = false;
  }
};

window.downloadCsvErrorLog = function (errors) {
  let text = '=== Error Log Import CSV ===\n';
  text += 'Dibuat: ' + new Date().toLocaleString('id-ID') + '\n\n';
  errors.forEach(function (e) {
    text += 'Baris ' + (e.baris || '-') + ' | NIS: ' + (e.nis || '-') + '\n';
    (e.errors || []).forEach(function (msg) {
      text += '  - ' + msg + '\n';
    });
    text += '\n';
  });

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'error-log-import-csv-' + Date.now() + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.importCsvHandler = async function (e) {
  e.preventDefault();

  const fileInput = document.getElementById('csvFile');
  const file = fileInput ? fileInput.files[0] : null;

  const sucEl = document.getElementById('alertSuccess');
  const errEl = document.getElementById('alertError');
  if (sucEl) sucEl.hidden = true;
  if (errEl) errEl.hidden = true;

  if (!file) {
    window.showSiswaAlert('Pilih file CSV terlebih dahulu.', 'error');
    return;
  }

  if (!file.name.endsWith('.csv')) {
    window.showSiswaAlert('File harus berformat CSV.', 'error');
    return;
  }

  const btn = document.getElementById('btnImportCsv');
  const textEl = document.getElementById('btnImportCsvText');
  const loadEl = document.getElementById('btnImportCsvLoader');
  if (btn) btn.disabled = true;
  if (textEl) textEl.hidden = true;
  if (loadEl) loadEl.hidden = false;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/siswa/import-csv', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      var msg = data.data.inserted + ' data berhasil diupload.';
      if (data.data.failed > 0) {
        msg +=
          ' ' +
          data.data.failed +
          ' gagal. <a href="#" onclick="window.downloadCsvErrorLog(\'' +
          JSON.stringify(data.data.errors).replace(/'/g, "\\'") +
          '\'); return false;" style="color:var(--danger);">Download error log</a>';
      }
      window.showSiswaAlert(msg, 'success');
      fileInput.value = '';
      window.loadSiswa();
    } else {
      window.showSiswaAlert(data.message || 'Gagal mengupload CSV.', 'error');
      if (data.data && data.data.errors && data.data.errors.length > 0) {
        var errMsg =
          data.message +
          ' <a href="#" onclick="window.downloadCsvErrorLog(\'' +
          JSON.stringify(data.data.errors).replace(/'/g, "\\'") +
          '\'); return false;" style="color:var(--danger);">Download error log</a>';
        window.showSiswaAlert(errMsg, 'error');
      }
    }
  } catch (err) {
    window.showSiswaAlert('Gagal mengupload file: ' + (err.message || ''), 'error');
  } finally {
    if (btn) btn.disabled = false;
    if (textEl) textEl.hidden = false;
    if (loadEl) loadEl.hidden = true;
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

  document.getElementById('formImportCsv')?.addEventListener('submit', window.importCsvHandler);

  window.loadSiswa();
};
