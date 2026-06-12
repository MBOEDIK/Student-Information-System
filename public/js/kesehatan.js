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
      showAlertKesehatan(json.message || 'Gagal memuat data kesehatan.', 'error');
      return;
    }
    const d = json.data;
    document.getElementById('editStudentId').value = d.student_id;
    document.getElementById('siswa-select').style.display = 'none';
    document.getElementById('displaySiswa').style.display = 'block';
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
    showAlertKesehatan('Gagal memuat data kesehatan.', 'error');
  }
};

function resetFormKesehatan() {
  document.getElementById('editStudentId').value = '';
  document.getElementById('siswa-select').style.display = 'block';
  document.getElementById('displaySiswa').style.display = 'none';
  document.getElementById('displaySiswa').value = '';
  document.getElementById('golongan_darah').value = '';
  document.getElementById('penyakit_bawaan').value = '';
  document.getElementById('riwayat_vaksin').value = '';
  document.getElementById('alergi').value = '';
  document.getElementById('formTitle').textContent = 'Tambah Data Kesehatan';
  document.getElementById('btnSimpanText').textContent = 'Simpan';
  const errors = document.querySelectorAll('#formKesehatan .field-error');
  for (let i = 0; i < errors.length; i++) {
    errors[i].textContent = '';
  }
  const inputs = document.querySelectorAll('#formKesehatan .form-input');
  for (let j = 0; j < inputs.length; j++) {
    inputs[j].classList.remove('input--error');
  }
}

function showAlertKesehatan(msg, type) {
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
}

function setLoadingKesehatan(on) {
  const btn = document.getElementById('btnSimpan');
  const textEl = document.getElementById('btnSimpanText');
  const loadEl = document.getElementById('btnSimpanLoader');
  if (btn) btn.disabled = on;
  if (textEl) textEl.hidden = on;
  if (loadEl) loadEl.hidden = !on;
}

window.page_kesehatan_init = function () {
  window.loadDaftarKesehatan();

  const select = document.getElementById('siswa-select');
  if (select) {
    fetch('/api/kesehatan/siswa')
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        if (json.success && json.data) {
          json.data.forEach(function (siswa) {
            const opt = document.createElement('option');
            opt.value = siswa.id;
            opt.textContent = siswa.nama + ' (' + siswa.nis + ')';
            select.appendChild(opt);
          });
        }
      })
      .catch(function (err) {
        console.error('[KESEHATAN] Gagal memuat daftar siswa:', err.message);
      });
  }

  const form = document.getElementById('formKesehatan');
  if (!form) return;

  document.getElementById('btnReset')?.addEventListener('click', function (e) {
    e.preventDefault();
    resetFormKesehatan();
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    document.getElementById('alertSuccess').hidden = true;
    document.getElementById('alertError').hidden = true;
    const errors = document.querySelectorAll('#formKesehatan .field-error');
    for (let i = 0; i < errors.length; i++) {
      errors[i].textContent = '';
    }
    const inputs = document.querySelectorAll('#formKesehatan .form-input');
    for (let j = 0; j < inputs.length; j++) {
      inputs[j].classList.remove('input--error');
    }

    const editStudentId = document.getElementById('editStudentId').value;
    let student_id, method, url;

    if (editStudentId) {
      student_id = editStudentId;
      method = 'PUT';
      url = '/api/kesehatan/' + student_id;
    } else {
      student_id = document.getElementById('siswa-select').value;
      if (!student_id) {
        const errField = document.getElementById('err-siswa');
        if (errField) errField.textContent = 'Silakan pilih siswa.';
        const group = document.getElementById('group-siswa');
        if (group) {
          const inp = group.querySelector('.form-input');
          if (inp) inp.classList.add('input--error');
        }
        return;
      }
      method = 'POST';
      url = '/api/kesehatan';
    }

    const golongan_darah = document.getElementById('golongan_darah').value;
    const penyakit_bawaan = document.getElementById('penyakit_bawaan').value.trim();
    const riwayat_vaksin = document.getElementById('riwayat_vaksin').value.trim();
    const alergi = document.getElementById('alergi').value.trim();

    setLoadingKesehatan(true);

    try {
      const data = await window.api(url, {
        method: method,
        body: JSON.stringify({
          student_id: parseInt(student_id, 10),
          golongan_darah: golongan_darah || null,
          penyakit_bawaan: penyakit_bawaan || null,
          riwayat_vaksin: riwayat_vaksin || null,
          alergi: alergi || null
        })
      });

      if (data.success) {
        showAlertKesehatan(data.message, 'success');
        resetFormKesehatan();
        window.loadDaftarKesehatan();
      }
    } catch (err) {
      showAlertKesehatan(err.message || 'Gagal memproses data kesehatan.', 'error');
    } finally {
      setLoadingKesehatan(false);
    }
  });
};
