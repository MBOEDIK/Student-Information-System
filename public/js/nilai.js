'use strict';

let guruTeacherId = null;
let currentSubjectId = null;

function hideNilaiAlerts() {
  const sucEl = document.getElementById('alertSuccess');
  const errEl = document.getElementById('alertError');
  if (sucEl) sucEl.hidden = true;
  if (errEl) errEl.hidden = true;
}

function showNilaiAlert(msg, type) {
  if (!msg) {
    hideNilaiAlerts();
    return;
  }
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

function setNilaiLoading(on) {
  const btn = document.getElementById('btnSimpanNilai');
  const textEl = document.getElementById('btnSimpanNilaiText');
  const loadEl = document.getElementById('btnSimpanNilaiLoader');
  if (btn) btn.disabled = on;
  if (textEl) textEl.hidden = on;
  if (loadEl) loadEl.hidden = !on;
}

window.loadMapelGuru = async function () {
  if (!guruTeacherId) return;
  const select = document.getElementById('nilaiMapelSelect');
  if (!select) return;
  select.innerHTML = '<option value="">-- Pilih Mata Pelajaran --</option>';
  try {
    const res = await fetch(
      '/api/nilai/mapel-guru?teacher_id=' + encodeURIComponent(guruTeacherId)
    );
    const json = await res.json();
    if (json.success && json.data) {
      json.data.forEach(function (m) {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.nama_pelajaran;
        select.appendChild(opt);
      });
    }
  } catch (e) {
    console.error('[NILAI] loadMapelGuru:', e.message);
  }
};

window.loadSiswaNilai = async function (subjectId) {
  const tbody = document.getElementById('nilaiTableBody');
  const wrapper = document.getElementById('nilaiTableWrapper');
  const actions = document.getElementById('nilaiActions');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Memuat data...</td></tr>';
  const semester = document.getElementById('nilaiSemester').value || 'Ganjil 2025/2026';
  try {
    const res = await fetch(
      '/api/nilai/siswa-by-mapel?subject_id=' +
        subjectId +
        '&teacher_id=' +
        encodeURIComponent(guruTeacherId) +
        '&semester=' +
        encodeURIComponent(semester)
    );
    const json = await res.json();
    if (!json.success) {
      showNilaiAlert(json.message || 'Gagal memuat data siswa', 'error');
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center text-muted">Tidak ada siswa terdaftar di mata pelajaran ini.</td></tr>';
      if (wrapper) wrapper.classList.remove('d-none');
      if (actions) actions.hidden = true;
      return;
    }
    if (!json.data.length) {
      hideNilaiAlerts();
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center text-muted">Tidak ada siswa terdaftar di mata pelajaran ini.</td></tr>';
      if (wrapper) wrapper.classList.remove('d-none');
      if (actions) actions.hidden = true;
      return;
    }
    tbody.innerHTML = json.data
      .map(function (r, i) {
        const tugasVal = r.tugas !== null ? r.tugas : '';
        const utsVal = r.uts !== null ? r.uts : '';
        const uasVal = r.uas !== null ? r.uas : '';
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
          '<td><input type="number" class="form-input input-nilai" data-student-id="' +
          r.student_id +
          '" data-field="tugas" value="' +
          tugasVal +
          '" min="0" max="100" step="0.01" placeholder="0-100" /></td>' +
          '<td><input type="number" class="form-input input-nilai" data-student-id="' +
          r.student_id +
          '" data-field="uts" value="' +
          utsVal +
          '" min="0" max="100" step="0.01" placeholder="0-100" /></td>' +
          '<td><input type="number" class="form-input input-nilai" data-student-id="' +
          r.student_id +
          '" data-field="uas" value="' +
          uasVal +
          '" min="0" max="100" step="0.01" placeholder="0-100" /></td>' +
          '</tr>'
        );
      })
      .join('');
    if (wrapper) wrapper.classList.remove('d-none');
    if (actions) actions.hidden = false;
  } catch (e) {
    showNilaiAlert('Gagal memuat data siswa: ' + e.message, 'error');
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center text-danger">Gagal memuat data.</td></tr>';
    if (wrapper) wrapper.classList.remove('d-none');
  }
};

window.simpanNilai = async function () {
  const inputs = document.querySelectorAll('.input-nilai');
  const entries = {};
  const semester = document.getElementById('nilaiSemester').value || 'Ganjil 2025/2026';

  for (let i = 0; i < inputs.length; i++) {
    const inp = inputs[i];
    const studentId = inp.getAttribute('data-student-id');
    const field = inp.getAttribute('data-field');
    const val = inp.value.trim();

    if (!entries[studentId]) {
      entries[studentId] = { student_id: parseInt(studentId, 10), tugas: '', uts: '', uas: '' };
    }
    entries[studentId][field] = val;
  }

  const entriesArr = Object.keys(entries).map(function (k) {
    return entries[k];
  });

  setNilaiLoading(true);
  try {
    const data = await window.api('/api/nilai/batch', {
      method: 'POST',
      body: JSON.stringify({
        subject_id: parseInt(currentSubjectId, 10),
        teacher_id: parseInt(guruTeacherId, 10),
        semester: semester,
        entries: entriesArr
      })
    });

    if (data.success) {
      showNilaiAlert(data.message, 'success');
      window.loadSiswaNilai(currentSubjectId);
    }
  } catch (err) {
    let msg = err.message || 'Gagal menyimpan nilai.';
    try {
      const errData = JSON.parse(msg);
      if (errData.errors && Array.isArray(errData.errors)) {
        msg = errData.errors.join('<br/>');
      } else if (errData.message) {
        msg = errData.message;
      }
    } catch (_) {
      // ignore parse error, fallback to raw msg
    }
    showNilaiAlert(msg, 'error');
  } finally {
    setNilaiLoading(false);
  }
};

window.page_nilai_init = function () {
  if (window.currentUser && window.currentUser.role === 'guru') {
    guruTeacherId = window.currentUser.teacher_id;
  }

  const select = document.getElementById('nilaiMapelSelect');
  if (!select) return;

  window.loadMapelGuru();

  select.addEventListener('change', function () {
    const val = this.value;
    if (!val) {
      const wrapper = document.getElementById('nilaiTableWrapper');
      const actions = document.getElementById('nilaiActions');
      const tbody = document.getElementById('nilaiTableBody');
      if (wrapper) wrapper.classList.add('d-none');
      if (actions) actions.hidden = true;
      if (tbody)
        tbody.innerHTML =
          '<tr><td colspan="6" class="text-center text-muted">Pilih mata pelajaran terlebih dahulu.</td></tr>';
      currentSubjectId = null;
      return;
    }
    currentSubjectId = val;
    hideNilaiAlerts();
    window.loadSiswaNilai(val);
  });

  const btn = document.getElementById('btnSimpanNilai');
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.simpanNilai();
    });
  }
};
