'use strict';

window.loadSiswaKonseling = async function () {
  const select = document.getElementById('siswaSelect');
  const filter = document.getElementById('filterSiswa');
  if (!select && !filter) return;

  try {
    const res = await fetch('/api/konseling/siswa');
    const json = await res.json();
    if (!json.success || !json.data) return;

    [select, filter].forEach(function (el) {
      if (!el) return;
      const currentVal = el.value;
      el.innerHTML =
        '<option value="">' +
        (el.id === 'filterSiswa' ? 'Semua Siswa' : '— Pilih Siswa —') +
        '</option>';
      json.data.forEach(function (siswa) {
        const opt = document.createElement('option');
        opt.value = siswa.id;
        opt.textContent = siswa.nama + ' (' + siswa.nis + ')';
        el.appendChild(opt);
      });
      el.value = currentVal;
    });
  } catch (err) {
    console.error('[KONSELING] loadSiswaKonseling:', err.message);
  }
};

window.loadRiwayatKonseling = async function (studentId) {
  const tbody = document.getElementById('riwayatTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Memuat data...</td></tr>';

  try {
    let url = '/api/konseling';
    if (studentId) {
      url += '?student_id=' + encodeURIComponent(studentId);
    }

    const res = await fetch(url);
    const json = await res.json();

    if (!json.success || !json.data || json.data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center text-muted">Belum ada catatan konseling.</td></tr>';
      return;
    }

    tbody.innerHTML = json.data
      .map(function (r, i) {
        return (
          '<tr>' +
          '<td>' +
          (i + 1) +
          '</td>' +
          '<td>' +
          new Date(r.tanggal).toLocaleDateString('id-ID') +
          '</td>' +
          '<td><strong>' +
          r.nama_siswa +
          '</strong></td>' +
          '<td>' +
          (r.topik || '–') +
          '</td>' +
          '<td>' +
          (r.tindak_lanjut || '–') +
          '</td>' +
          '<td>' +
          '<button class="btn btn--icon btn--icon-view" onclick="window.showDetailKonseling(' +
          r.id +
          ')" title="Lihat Detail">' +
          '<i class="bi bi-eye"></i>' +
          '</button>' +
          '</td>' +
          '</tr>'
        );
      })
      .join('');
  } catch (err) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center text-danger">Gagal memuat data.</td></tr>';
    console.error('[KONSELING] loadRiwayatKonseling:', err.message);
  }
};

window.showDetailKonseling = async function (id) {
  try {
    const res = await fetch('/api/konseling/' + id);
    const json = await res.json();

    if (!json.success) {
      showAlertKonseling(json.message || 'Gagal memuat detail.', 'error');
      return;
    }

    const d = json.data;
    document.getElementById('detailSiswa').value = d.nama_siswa;
    document.getElementById('detailTanggal').value = new Date(d.tanggal).toLocaleDateString(
      'id-ID'
    );
    document.getElementById('detailTopik').value = d.topik || '–';
    document.getElementById('detailDeskripsi').value = d.deskripsi || '–';
    document.getElementById('detailTindakLanjut').value = d.tindak_lanjut || '–';
    window.openModal('modalDetailKonseling');
  } catch (err) {
    showAlertKonseling('Gagal memuat detail.', 'error');
    console.error('[KONSELING] showDetailKonseling:', err.message);
  }
};

function toggleFormKonseling(show) {
  const form = document.getElementById('formKonseling');
  const icon = document.getElementById('tambahKonselingIcon');
  if (show) {
    form.classList.remove('d-none');
    icon.className = 'bi bi-dash-circle toggle-header__icon';
  } else {
    form.classList.add('d-none');
    icon.className = 'bi bi-plus-circle toggle-header__icon';
  }
}

function resetFormKonseling() {
  document.getElementById('siswaSelect').value = '';
  document.getElementById('tanggalKonseling').value = new Date().toISOString().slice(0, 10);
  document.getElementById('topikKonseling').value = '';
  document.getElementById('deskripsiKonseling').value = '';
  document.getElementById('tindakLanjutKonseling').value = '';
  const errors = document.querySelectorAll('#formKonseling .field-error');
  for (let i = 0; i < errors.length; i++) {
    errors[i].textContent = '';
  }
  const inputs = document.querySelectorAll('#formKonseling .form-input');
  for (let j = 0; j < inputs.length; j++) {
    inputs[j].classList.remove('input--error');
  }
}

function showAlertKonseling(msg, type) {
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

function setLoadingKonseling(on) {
  const btn = document.getElementById('btnSimpanKonseling');
  const textEl = document.getElementById('btnSimpanKonselingText');
  const loadEl = document.getElementById('btnSimpanKonselingLoader');
  if (btn) btn.disabled = on;
  if (textEl) textEl.hidden = on;
  if (loadEl) loadEl.hidden = !on;
}

window.page_konseling_init = function () {
  const tanggalInput = document.getElementById('tanggalKonseling');
  if (tanggalInput) {
    tanggalInput.value = new Date().toISOString().slice(0, 10);
  }

  window.loadSiswaKonseling();
  window.loadRiwayatKonseling();

  document.getElementById('tambahKonselingToggle')?.addEventListener('click', function () {
    const form = document.getElementById('formKonseling');
    toggleFormKonseling(form.classList.contains('d-none'));
  });

  document.getElementById('btnResetKonseling')?.addEventListener('click', function (e) {
    e.preventDefault();
    resetFormKonseling();
  });

  document.getElementById('filterSiswa')?.addEventListener('change', function () {
    window.loadRiwayatKonseling(this.value);
  });

  const form = document.getElementById('formKonseling');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    document.getElementById('alertSuccess').hidden = true;
    document.getElementById('alertError').hidden = true;
    const errors = document.querySelectorAll('#formKonseling .field-error');
    for (let i = 0; i < errors.length; i++) {
      errors[i].textContent = '';
    }
    const inputs = document.querySelectorAll('#formKonseling .form-input');
    for (let j = 0; j < inputs.length; j++) {
      inputs[j].classList.remove('input--error');
    }

    const student_id = document.getElementById('siswaSelect').value;
    if (!student_id) {
      const errField = document.getElementById('err-siswa');
      if (errField) errField.textContent = 'Silakan pilih siswa.';
      const group = document.getElementById('siswaSelect').closest('.form-group');
      if (group) {
        const inp = group.querySelector('.form-input');
        if (inp) inp.classList.add('input--error');
      }
      return;
    }

    const topik = document.getElementById('topikKonseling').value.trim();
    if (!topik || topik.length < 3) {
      const errTopik = document.getElementById('err-topik');
      if (errTopik) errTopik.textContent = 'Topik konseling minimal 3 karakter.';
      const topikInput = document.getElementById('topikKonseling');
      if (topikInput) topikInput.classList.add('input--error');
      return;
    }

    const tanggal = document.getElementById('tanggalKonseling').value;
    const deskripsi = document.getElementById('deskripsiKonseling').value.trim();
    const tindak_lanjut = document.getElementById('tindakLanjutKonseling').value.trim();

    setLoadingKonseling(true);

    try {
      const data = await window.api('/api/konseling', {
        method: 'POST',
        body: JSON.stringify({
          student_id: parseInt(student_id, 10),
          topik: topik,
          deskripsi: deskripsi || null,
          tindak_lanjut: tindak_lanjut || null,
          tanggal: tanggal || null
        })
      });

      if (data.success) {
        showAlertKonseling(data.message, 'success');
        resetFormKonseling();
        toggleFormKonseling(false);
        window.loadRiwayatKonseling(document.getElementById('filterSiswa')?.value || '');
      }
    } catch (err) {
      showAlertKonseling(err.message || 'Gagal menyimpan catatan konseling.', 'error');
    } finally {
      setLoadingKonseling(false);
    }
  });
};
