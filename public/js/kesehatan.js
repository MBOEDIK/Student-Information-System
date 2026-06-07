'use strict';

window.loadDaftarKesehatan = async function () {
  const tbody = document.getElementById('kesehatanTableBody');
  if (!tbody) return;
  tbody.innerHTML =
    '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Memuat data...</td></tr>';
  try {
    const res = await fetch('/api/kesehatan');
    const json = await res.json();
    if (!json.success || !json.data.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Belum ada data kesehatan.</td></tr>';
      return;
    }
    tbody.innerHTML = json.data
      .map(function (r, i) {
        return (
          '<tr>' +
          '<td>' +
          (i + 1) +
          '</td>' +
          '<td><strong>' +
          r.nis +
          '</strong></td>' +
          '<td>' +
          r.nama +
          '</td>' +
          '<td>' +
          (r.golongan_darah || '–') +
          '</td>' +
          '<td><button class="btn btn--sm btn--primary" onclick="window.editKesehatan(' +
          r.student_id +
          ')">Edit</button></td>' +
          '</tr>'
        );
      })
      .join('');
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;color:var(--danger);">Gagal memuat data.</td></tr>';
  }
};

window.editKesehatan = async function (studentId) {
  try {
    const res = await fetch('/api/kesehatan/' + studentId);
    const json = await res.json();
    if (!json.success) {
      kesehatanShowError(json.message || 'Gagal memuat data kesehatan.');
      return;
    }
    const d = json.data;
    document.getElementById('editStudentId').value = d.student_id;
    document.getElementById('displaySiswa').value = d.nis + ' - ' + d.nama;
    document.getElementById('golongan_darah').value = d.golongan_darah || '';
    document.getElementById('penyakit_bawaan').value = d.penyakit_bawaan || '';
    document.getElementById('riwayat_vaksin').value = d.riwayat_vaksin || '';
    document.getElementById('alergi').value = d.alergi || '';
    document.getElementById('formTitle').textContent = 'Edit Data Kesehatan - ' + d.nama;
    document.getElementById('btnSimpanText').textContent = 'Perbarui';
    window.scrollTo({
      top: document.getElementById('formKesehatan').offsetTop - 20,
      behavior: 'smooth'
    });
  } catch (e) {
    kesehatanShowError('Gagal memuat data kesehatan.');
  }
};

function kesehatanResetForm() {
  document.getElementById('editStudentId').value = '';
  document.getElementById('displaySiswa').value = '';
  document.getElementById('golongan_darah').value = '';
  document.getElementById('penyakit_bawaan').value = '';
  document.getElementById('riwayat_vaksin').value = '';
  document.getElementById('alergi').value = '';
  document.getElementById('formTitle').textContent = 'Edit Data Kesehatan';
  document.querySelectorAll('#formKesehatan .field-error').forEach(function (e) {
    e.textContent = '';
  });
  document.querySelectorAll('#formKesehatan .form-input').forEach(function (e) {
    e.classList.remove('input--error');
  });
}

function kesehatanShowSuccess(msg) {
  const el = document.getElementById('alertSuccess');
  const txt = document.getElementById('alertSuccessMsg');
  const errEl = document.getElementById('alertError');
  if (errEl) errEl.hidden = true;
  if (txt) txt.textContent = msg;
  if (el) el.hidden = false;
}

function kesehatanShowError(msg) {
  const el = document.getElementById('alertError');
  const txt = document.getElementById('alertErrorMsg');
  const sucEl = document.getElementById('alertSuccess');
  if (sucEl) sucEl.hidden = true;
  if (txt) txt.textContent = msg;
  if (el) el.hidden = false;
}

function kesehatanSetLoading(on) {
  const btn = document.getElementById('btnSimpan');
  const textEl = document.getElementById('btnSimpanText');
  const loadEl = document.getElementById('btnSimpanLoader');
  if (btn) btn.disabled = on;
  if (textEl) textEl.hidden = on;
  if (loadEl) loadEl.hidden = !on;
}

window.page_kesehatan_init = function () {
  window.loadDaftarKesehatan();

  const form = document.getElementById('formKesehatan');
  if (!form) return;

  document.getElementById('btnReset').addEventListener('click', function (e) {
    e.preventDefault();
    kesehatanResetForm();
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    document.querySelectorAll('#formKesehatan .field-error').forEach(function (el) {
      el.textContent = '';
    });
    document.querySelectorAll('#formKesehatan .form-input').forEach(function (el) {
      el.classList.remove('input--error');
    });
    document.getElementById('alertSuccess').hidden = true;
    document.getElementById('alertError').hidden = true;

    const studentId = document.getElementById('editStudentId').value;
    if (!studentId) {
      kesehatanShowError('Pilih siswa dari tabel terlebih dahulu.');
      return;
    }

    const golongan_darah = document.getElementById('golongan_darah').value;
    if (!golongan_darah) {
      document.getElementById('err-golongan_darah').textContent = 'Golongan darah harus dipilih.';
      document.getElementById('golongan_darah').classList.add('input--error');
      return;
    }

    const body = {
      golongan_darah: golongan_darah,
      penyakit_bawaan: document.getElementById('penyakit_bawaan').value.trim(),
      riwayat_vaksin: document.getElementById('riwayat_vaksin').value.trim(),
      alergi: document.getElementById('alergi').value.trim()
    };

    kesehatanSetLoading(true);

    try {
      const data = await window.api('/api/kesehatan/' + studentId, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      kesehatanShowSuccess(data.message || 'Data kesehatan berhasil diperbarui.');
      kesehatanResetForm();
      window.loadDaftarKesehatan();
    } catch (err) {
      kesehatanShowError(err.message || 'Gagal memperbarui data kesehatan.');
    } finally {
      kesehatanSetLoading(false);
    }
  });
};
