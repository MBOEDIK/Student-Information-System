'use strict';

window.loadDaftarKesehatan = async function () {
  const tbody = document.getElementById('kesehatanTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Memuat data...</td></tr>';
  try {
    const res = await fetch('/api/kesehatan');
    const json = await res.json();
    if (!json.success || !json.data.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center text-muted">Belum ada data kesehatan.</td></tr>';
      return;
    }
    tbody.innerHTML = json.data
      .map(function (r, i) {
        var hasCondition = r.penyakit_bawaan || r.alergi;
        var kontakBtn = hasCondition
          ? '<button class="btn btn--icon btn--icon-danger" onclick="window.showKontakDarurat(' +
            r.student_id +
            ')" title="Kontak Darurat"><i class="bi bi-telephone-fill"></i></button>'
          : '–';
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
          '<td class="text-center">' +
          kontakBtn +
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
      '<tr><td colspan="6" class="text-center text-danger">Gagal memuat data.</td></tr>';
  }
};

window.showKontakDarurat = async function (studentId) {
  try {
    var res = await fetch('/api/kesehatan/' + studentId + '/kontak');
    var json = await res.json();
    if (!json.success) {
      showAlertKesehatan(json.message || 'Gagal memuat data kontak.', 'error');
      return;
    }
    var d = json.data;
    document.getElementById('kontak-nama-siswa').value = d.nama || '–';
    document.getElementById('kontak-nama-wali').value = d.nama_wali || '–';
    document.getElementById('kontak-no-hp-wali').value = d.no_hp_wali || '–';
    document.getElementById('kontak-penyakit-bawaan').value = d.penyakit_bawaan || '–';
    document.getElementById('kontak-alergi').value = d.alergi || '–';
    var hubungi = document.getElementById('kontak-hubungi');
    if (d.no_hp_wali) {
      hubungi.href = 'tel:' + d.no_hp_wali;
      hubungi.classList.remove('btn--disabled');
    } else {
      hubungi.href = '#';
      hubungi.classList.add('btn--disabled');
    }
    window.openModal('modal-kontak-darurat');
  } catch (e) {
    showAlertKesehatan('Gagal memuat data kontak darurat.', 'error');
    console.error('[KESEHATAN] showKontakDarurat:', e.message);
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
    document.getElementById('editDisplaySiswa').value = d.nis + ' - ' + d.nama;
    document.getElementById('editGolonganDarah').value = d.golongan_darah || '';
    document.getElementById('editPenyakitBawaan').value = d.penyakit_bawaan || '';
    document.getElementById('editRiwayatVaksin').value = d.riwayat_vaksin || '';
    document.getElementById('editAlergi').value = d.alergi || '';
    document.getElementById('modalFormTitle').textContent = 'Edit Data Kesehatan - ' + d.nama;
    window.openModal('modal-edit-kesehatan');
  } catch (e) {
    showAlertKesehatan('Gagal memuat data kesehatan.', 'error');
  }
};

function toggleFormKesehatan(show) {
  const form = document.getElementById('formKesehatan');
  const icon = document.getElementById('tambahKesehatanIcon');
  if (show) {
    form.classList.remove('d-none');
    icon.className = 'bi bi-dash-circle toggle-header__icon';
  } else {
    form.classList.add('d-none');
    icon.className = 'bi bi-plus-circle toggle-header__icon';
  }
}

function resetFormKesehatan() {
  document.getElementById('siswa-select').value = '';
  document.getElementById('golongan_darah').value = '';
  document.getElementById('penyakit_bawaan').value = '';
  document.getElementById('riwayat_vaksin').value = '';
  document.getElementById('alergi').value = '';
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

function setLoadingEdit(on) {
  const btn = document.getElementById('btnSimpanEdit');
  const textEl = document.getElementById('btnSimpanEditText');
  const loadEl = document.getElementById('btnSimpanEditLoader');
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

  document.getElementById('tambahKesehatanToggle').addEventListener('click', function () {
    const form = document.getElementById('formKesehatan');
    toggleFormKesehatan(form.classList.contains('d-none'));
  });

  document.getElementById('btnReset')?.addEventListener('click', function (e) {
    e.preventDefault();
    resetFormKesehatan();
  });

  const form = document.getElementById('formKesehatan');
  if (!form) return;

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

    const student_id = document.getElementById('siswa-select').value;
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

    const golongan_darah = document.getElementById('golongan_darah').value;
    const penyakit_bawaan = document.getElementById('penyakit_bawaan').value.trim();
    const riwayat_vaksin = document.getElementById('riwayat_vaksin').value.trim();
    const alergi = document.getElementById('alergi').value.trim();

    setLoadingKesehatan(true);

    try {
      const data = await window.api('/api/kesehatan', {
        method: 'POST',
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
        toggleFormKesehatan(false);
        window.loadDaftarKesehatan();
      }
    } catch (err) {
      showAlertKesehatan(err.message || 'Gagal memproses data kesehatan.', 'error');
    } finally {
      setLoadingKesehatan(false);
    }
  });

  const editForm = document.getElementById('formEditKesehatan');
  if (!editForm) return;

  editForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const studentId = document.getElementById('editStudentId').value;
    if (!studentId) return;

    const golongan_darah = document.getElementById('editGolonganDarah').value;
    const penyakit_bawaan = document.getElementById('editPenyakitBawaan').value.trim();
    const riwayat_vaksin = document.getElementById('editRiwayatVaksin').value.trim();
    const alergi = document.getElementById('editAlergi').value.trim();

    setLoadingEdit(true);

    try {
      const data = await window.api('/api/kesehatan/' + studentId, {
        method: 'PUT',
        body: JSON.stringify({
          student_id: parseInt(studentId, 10),
          golongan_darah: golongan_darah || null,
          penyakit_bawaan: penyakit_bawaan || null,
          riwayat_vaksin: riwayat_vaksin || null,
          alergi: alergi || null
        })
      });

      if (data.success) {
        showAlertKesehatan(data.message, 'success');
        window.closeModal('modal-edit-kesehatan');
        window.loadDaftarKesehatan();
      }
    } catch (err) {
      showAlertKesehatan(err.message || 'Gagal memperbarui data kesehatan.', 'error');
    } finally {
      setLoadingEdit(false);
    }
  });
};
