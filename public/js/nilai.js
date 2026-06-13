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
    tbody.innerHTML = json.data.map((g, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${g.semester}</td>
        <td>${g.nama_pelajaran}</td>
        <td>${g.tugas ?? '–'}</td>
        <td>${g.uts ?? '–'}</td>
        <td>${g.uas ?? '–'}</td>
        <td><strong>${g.rata_rata ?? '–'}</strong></td>
      </tr>
    `).join('');
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
    const nis = window.currentUser.username;
    window.loadTranskripSiswa(nis);
    return;
  }
};
