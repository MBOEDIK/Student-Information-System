'use strict';

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(function (h) {
    return h.trim().toLowerCase();
  });

  const nisIdx = headers.indexOf('nis');
  const namaIdx = headers.indexOf('nama');
  const jkIdx = headers.indexOf('jenis_kelamin');
  const alamatIdx = headers.indexOf('alamat');

  if (nisIdx === -1 || namaIdx === -1) {
    throw new Error('Format CSV harus memiliki kolom: nis, nama, jenis_kelamin, alamat');
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(function (c) {
      return c.trim();
    });
    if (cols.length === 1 && cols[0] === '') continue;

    rows.push({
      nis: cols[nisIdx] || '',
      nama: cols[namaIdx] || '',
      jenis_kelamin: jkIdx !== -1 ? cols[jkIdx] || '' : '',
      alamat: alamatIdx !== -1 ? cols[alamatIdx] || '' : ''
    });
  }
  return rows;
}

window.uploadSiswaCSV = async function () {
  const fileInput = document.getElementById('csvFileInput');
  const file = fileInput ? fileInput.files[0] : null;
  const errEl = document.getElementById('errFile');
  var sucEl = document.getElementById('alertSuccess');
  var errAlertEl = document.getElementById('alertError');
  if (sucEl) sucEl.hidden = true;
  if (errAlertEl) errAlertEl.hidden = true;
  if (errEl) errEl.textContent = '';

  if (!file) {
    if (errEl) errEl.textContent = 'Pilih file CSV terlebih dahulu.';
    return;
  }

  if (!file.name.endsWith('.csv')) {
    if (errEl) errEl.textContent = 'File harus berformat CSV.';
    return;
  }

  const btn = document.getElementById('btnUploadCSV');
  const textEl = document.getElementById('btnUploadText');
  const loadEl = document.getElementById('btnUploadLoader');
  if (btn) btn.disabled = true;
  if (textEl) textEl.hidden = true;
  if (loadEl) loadEl.hidden = false;

  try {
    const text = await file.text();
    const entries = parseCSV(text);

    if (entries.length === 0) {
      window.showUploadAlert('File CSV kosong atau format tidak sesuai.', 'error');
      if (btn) btn.disabled = false;
      if (textEl) textEl.hidden = false;
      if (loadEl) loadEl.hidden = true;
      return;
    }

    if (entries.length > 500) {
      window.showUploadAlert('Maksimal 500 baris data per upload.', 'error');
      if (btn) btn.disabled = false;
      if (textEl) textEl.hidden = false;
      if (loadEl) loadEl.hidden = true;
      return;
    }

    const data = await window.api('/api/siswa/upload-csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: entries })
    });

    if (data.success) {
      window.showUploadAlert(data.message, 'success');
      window.renderUploadResult(data.data);
    } else {
      window.showUploadAlert(data.message, 'error');
    }
  } catch (err) {
    var msg = err.message || 'Gagal mengupload file.';
    if (msg.includes('CSV')) {
      window.showUploadAlert(msg, 'error');
    } else {
      window.showUploadAlert('Gagal mengupload file: ' + msg, 'error');
    }
  } finally {
    if (btn) btn.disabled = false;
    if (textEl) textEl.hidden = false;
    if (loadEl) loadEl.hidden = true;
  }
};

window.showUploadAlert = function (msg, type) {
  var sucEl = document.getElementById('alertSuccess');
  var errEl = document.getElementById('alertError');
  var txt = document.getElementById(type === 'error' ? 'alertErrorMsg' : 'alertSuccessMsg');
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

window.renderUploadResult = function (summary) {
  var wrapper = document.getElementById('resultWrapper');
  var title = document.getElementById('resultTitle');
  var tbody = document.getElementById('resultTableBody');
  if (!wrapper || !title || !tbody) return;

  wrapper.classList.remove('d-none');
  title.innerHTML =
    'Hasil Upload: <span style="color:var(--success)">' +
    summary.berhasil +
    ' berhasil</span>' +
    (summary.gagal_validasi > 0
      ? ' | <span style="color:var(--danger)">' + summary.gagal_validasi + ' validasi gagal</span>'
      : '') +
    (summary.gagal_duplikat > 0
      ? ' | <span style="color:var(--warning)">' + summary.gagal_duplikat + ' duplikat</span>'
      : '');

  if (summary.errors && summary.errors.length > 0) {
    var rows = summary.errors.map(function (e, i) {
      var errClass =
        e.errors && e.errors[0] && e.errors[0].includes('sudah terdaftar')
          ? 'badge badge--red'
          : 'badge badge--red';
      return (
        '<tr>' +
        '<td>' +
        (i + 1) +
        '</td>' +
        '<td><strong>' +
        (e.nis || '-') +
        '</strong></td>' +
        '<td colspan="3">' +
        (e.errors || []).join('<br/>') +
        '</td>' +
        '<td><span class="' +
        errClass +
        '">Gagal</span></td>' +
        '</tr>'
      );
    });
    tbody.innerHTML = rows.join('');
  } else {
    tbody.innerHTML = '';
  }
};

window.resetUploadForm = function () {
  var fileInput = document.getElementById('csvFileInput');
  var errEl = document.getElementById('errFile');
  var wrapper = document.getElementById('resultWrapper');
  var sucEl = document.getElementById('alertSuccess');
  var errAlertEl = document.getElementById('alertError');
  if (fileInput) fileInput.value = '';
  if (errEl) errEl.textContent = '';
  if (wrapper) wrapper.classList.add('d-none');
  if (sucEl) sucEl.hidden = true;
  if (errAlertEl) errAlertEl.hidden = true;
};

window.page_upload_siswa_init = function () {
  document.getElementById('btnUploadCSV')?.addEventListener('click', function (e) {
    e.preventDefault();
    window.uploadSiswaCSV();
  });

  document.getElementById('btnResetUpload')?.addEventListener('click', function (e) {
    e.preventDefault();
    window.resetUploadForm();
  });
};
