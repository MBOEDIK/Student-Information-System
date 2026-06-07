'use strict';

window.loadGuru = async function () {
  const tbody = document.getElementById('guruTableBody');
  if (!tbody) return;
  tbody.innerHTML =
    '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Memuat data...</td></tr>';
  try {
    const res = await fetch('/api/guru');
    const json = await res.json();
    if (!json.success || !json.data.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Belum ada data guru.</td></tr>';
      return;
    }
    tbody.innerHTML = json.data
      .map(
        (g, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${g.nip}</strong></td>
        <td>${g.nama}</td>
        <td>${g.email || '–'}</td>
        <td>${window.statusBadge(g.status)}</td>
        <td><button class="btn btn--sm btn--primary" onclick="editGuru(${g.id})">Edit</button></td>
      </tr>
    `
      )
      .join('');
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;color:var(--danger);">Gagal memuat data.</td></tr>';
  }
};

window.editGuru = async function (id) {
  try {
    const res = await fetch(`/api/guru/${id}`);
    const json = await res.json();
    const g = json.data;
    document.getElementById('edit-guru-id').value = g.id;
    document.getElementById('edit-guru-nama').value = g.nama;
    document.getElementById('edit-guru-nip').value = g.nip;
    document.getElementById('edit-guru-email').value = g.email || '';
    document.getElementById('edit-guru-status').value = g.status;
    window.openModal('modal-guru');
  } catch (e) {
    alert('Gagal memuat data guru.');
  }
};

window.simpanGuru = async function () {
  const id = document.getElementById('edit-guru-id').value;
  const body = {
    nama: document.getElementById('edit-guru-nama').value,
    nip: document.getElementById('edit-guru-nip').value,
    email: document.getElementById('edit-guru-email').value,
    status: document.getElementById('edit-guru-status').value
  };
  try {
    const res = await fetch(`/api/guru/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await res.json();
    alert(result.message);
    window.closeModal('modal-guru');
    window.loadGuru();
  } catch (e) {
    alert('Gagal menyimpan data guru.');
  }
};

window.page_guru_init = function () {
  window.loadGuru();
};
