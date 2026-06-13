'use strict';

var guruNip = null;
var currentSubjectId = null;

function showNilaiAlert(msg, type) {
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
}

function setNilaiLoading(on) {
  var btn = document.getElementById('btnSimpanNilai');
  var textEl = document.getElementById('btnSimpanNilaiText');
  var loadEl = document.getElementById('btnSimpanNilaiLoader');
  if (btn) btn.disabled = on;
  if (textEl) textEl.hidden = on;
  if (loadEl) loadEl.hidden = !on;
}

window.loadMapelGuru = async function () {
  if (!guruNip) return;
  var select = document.getElementById('nilaiMapelSelect');
  if (!select) return;
  select.innerHTML = '<option value="">-- Pilih Mata Pelajaran --</option>';
  try {
    var res = await fetch('/api/nilai/mapel-guru?nip=' + encodeURIComponent(guruNip));
    var json = await res.json();
    if (json.success && json.data) {
      json.data.forEach(function (m) {
        var opt = document.createElement('option');
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
  var tbody = document.getElementById('nilaiTableBody');
  var wrapper = document.getElementById('nilaiTableWrapper');
  var actions = document.getElementById('nilaiActions');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Memuat data...</td></tr>';
  try {
    var res = await fetch(
      '/api/nilai/siswa-by-mapel?subject_id=' + subjectId + '&nip=' + encodeURIComponent(guruNip)
    );
    var json = await res.json();
    if (!json.success || !json.data.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="text-center text-muted">Tidak ada siswa terdaftar di mata pelajaran ini.</td></tr>';
      if (wrapper) wrapper.style.display = '';
      if (actions) actions.hidden = true;
      return;
    }
    tbody.innerHTML = json.data
      .map(function (r, i) {
        var tugasVal = r.tugas !== null ? r.tugas : '';
        var utsVal = r.uts !== null ? r.uts : '';
        var uasVal = r.uas !== null ? r.uas : '';
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
    if (wrapper) wrapper.style.display = '';
    if (actions) actions.hidden = false;
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center text-danger">Gagal memuat data.</td></tr>';
    if (wrapper) wrapper.style.display = '';
  }
};

window.simpanNilai = async function () {
  var inputs = document.querySelectorAll('.input-nilai');
  var entries = {};
  var semester = document.getElementById('nilaiSemester').value || 'Ganjil 2025/2026';

  for (var i = 0; i < inputs.length; i++) {
    var inp = inputs[i];
    var studentId = inp.getAttribute('data-student-id');
    var field = inp.getAttribute('data-field');
    var val = inp.value.trim();

    if (!entries[studentId]) {
      entries[studentId] = { student_id: parseInt(studentId, 10), tugas: '', uts: '', uas: '' };
    }
    entries[studentId][field] = val;
  }

  var entriesArr = Object.keys(entries).map(function (k) {
    return entries[k];
  });

  setNilaiLoading(true);
  try {
    var data = await window.api('/api/nilai/batch', {
      method: 'POST',
      body: JSON.stringify({
        subject_id: parseInt(currentSubjectId, 10),
        nip: guruNip,
        semester: semester,
        entries: entriesArr
      })
    });

    if (data.success) {
      showNilaiAlert(data.message, 'success');
      window.loadSiswaNilai(currentSubjectId);
    }
  } catch (err) {
    var msg = err.message || 'Gagal menyimpan nilai.';
    try {
      var errData = JSON.parse(msg);
      if (errData.errors && Array.isArray(errData.errors)) {
        msg = errData.errors.join('<br/>');
      } else if (errData.message) {
        msg = errData.message;
      }
    } catch (_) {}
    showNilaiAlert(msg, 'error');
  } finally {
    setNilaiLoading(false);
  }
};

window.page_nilai_init = function () {
  if (window.currentUser && window.currentUser.role === 'guru') {
    guruNip = window.currentUser.username;
  }

  var select = document.getElementById('nilaiMapelSelect');
  if (!select) return;

  window.loadMapelGuru();

  select.addEventListener('change', function () {
    var val = this.value;
    if (!val) {
      var wrapper = document.getElementById('nilaiTableWrapper');
      var actions = document.getElementById('nilaiActions');
      var tbody = document.getElementById('nilaiTableBody');
      if (wrapper) wrapper.style.display = 'none';
      if (actions) actions.hidden = true;
      if (tbody)
        tbody.innerHTML =
          '<tr><td colspan="6" class="text-center text-muted">Pilih mata pelajaran terlebih dahulu.</td></tr>';
      currentSubjectId = null;
      return;
    }
    currentSubjectId = val;
    showNilaiAlert('', 'success');
    showNilaiAlert('', 'error');
    window.loadSiswaNilai(val);
  });

  var btn = document.getElementById('btnSimpanNilai');
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.simpanNilai();
    });
  }
};
