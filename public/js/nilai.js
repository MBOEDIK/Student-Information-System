'use strict';

window.loadTranskripSiswa = async (nis) => {
  const tbody = document.getElementById('transkripTableBody');
  const emptyState = document.getElementById('transkripEmpty');
  if (!tbody) return;
  try {
    const res = await fetch(`/api/nilai/transkrip?nis=${encodeURIComponent(nis)}`);
    const json = await res.json();
    if (!json.success || !json.data.length) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.hidden = false;
      return;
    }
    if (emptyState) emptyState.hidden = true;
    tbody.innerHTML = json.data
      .map(
        (g, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${g.semester}</td>
        <td>${g.nama_pelajaran}</td>
        <td>${g.tugas ?? '–'}</td>
        <td>${g.uts ?? '–'}</td>
        <td>${g.uas ?? '–'}</td>
        <td><strong>${g.rata_rata ?? '–'}</strong></td>
        <td><span class="badge badge--${g.grade === 'A' ? 'green' : g.grade === 'B' ? 'green' : g.grade === 'C' ? 'gray' : 'red'}">${g.grade ?? '–'}</span></td>
      </tr>
    `
      )
      .join('');
  } catch (err) {
    console.error('[NILAI] loadTranskripSiswa:', err.message);
  }
};

window.page_nilai_init = function () {
  if (window.currentUser?.role === 'siswa') {
    const siswaView = document.getElementById('nilai-siswa-view');
    const guruView = document.getElementById('nilai-guru-view');
    if (siswaView) siswaView.hidden = false;
    if (guruView) guruView.hidden = true;
    window.loadTranskripSiswa(window.currentUser.username);
    return;
  }
  if (window.currentUser?.role === 'admin') {
    const adminView = document.getElementById('nilai-admin-view');
    if (adminView) adminView.hidden = false;
    window.loadSiswaForAdmin();
    return;
  }
};

window.loadSiswaForAdmin = async () => {
  try {
    const res = await fetch('/api/siswa');
    const json = await res.json();
    const select = document.getElementById('selectSiswa');
    if (!select || !json.success) return;
    json.data.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.nis} — ${s.nama}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('[NILAI] loadSiswaForAdmin:', err.message);
  }
};

window.loadTranskripAdmin = async (siswaId) => {
  if (!siswaId) return;
  const result = document.getElementById('adminTranskripResult');
  const tbody = document.getElementById('adminTranskripTableBody');
  const emptyState = document.getElementById('adminTranskripEmpty');
  const siswaInfo = document.getElementById('adminSiswaInfo');
  try {
    const res = await fetch(`/api/nilai/transkrip-admin?siswaId=${encodeURIComponent(siswaId)}`);
    const json = await res.json();
    if (!json.success) return;
    const { siswa, grades } = json.data;
    if (siswaInfo) siswaInfo.textContent = `${siswa.nama} — ${siswa.nis}`;
    if (result) result.hidden = false;
    if (!grades.length) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.hidden = false;
      return;
    }
    if (emptyState) emptyState.hidden = true;
    tbody.innerHTML = grades
      .map(
        (g, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${g.semester}</td>
        <td>${g.nama_pelajaran}</td>
        <td>${g.tugas ?? '–'}</td>
        <td>${g.uts ?? '–'}</td>
        <td>${g.uas ?? '–'}</td>
        <td><strong>${g.rata_rata ?? '–'}</strong></td>
        <td><span class="badge badge--${g.grade === 'A' ? 'green' : g.grade === 'B' ? 'green' : g.grade === 'C' ? 'gray' : 'red'}">${g.grade ?? '–'}</span></td>
      </tr>
    `
      )
      .join('');
  } catch (err) {
    console.error('[NILAI] loadTranskripAdmin:', err.message);
  }
};

window.cetakTranskrip = () => {
  document.body.classList.add('print-mode');
  window.print();
  document.body.classList.remove('print-mode');
};
