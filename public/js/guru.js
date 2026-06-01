window.statusBadge = function (status) {
  const map = { 'aktif': 'success', 'tidak aktif': 'danger', 'pensiun': 'warning' };
  return `<span class="badge badge--${map[status] || 'secondary'}">${status}</span>`;
};

window.openModal = function (id) {
  document.getElementById(id).hidden = false;
};

window.closeModal = function (id) {
  document.getElementById(id).hidden = true;
};

window.loadGuru = async function () {
  const res = await fetch('/api/guru');
  const json = await res.json();
  const tbody = document.getElementById('guruTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  json.data.forEach((g, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${g.nip}</td>
        <td>${g.nama}</td>
        <td>${g.email || '-'}</td>
        <td>${window.statusBadge(g.status)}</td>
        <td><button class="btn btn--sm btn--primary" onclick="editGuru(${g.id})">Edit</button></td>
      </tr>`;
  });
};

window.editGuru = async function (id) {
  const res = await fetch(`/api/guru/${id}`);
  const json = await res.json();
  const g = json.data;
  document.getElementById('edit-guru-id').value    = g.id;
  document.getElementById('edit-guru-nama').value  = g.nama;
  document.getElementById('edit-guru-nip').value   = g.nip;
  document.getElementById('edit-guru-email').value = g.email || '';
  document.getElementById('edit-guru-status').value= g.status;
  window.openModal('modal-guru');
};

window.simpanGuru = async function () {
  const id = document.getElementById('edit-guru-id').value;
  const body = {
    nama   : document.getElementById('edit-guru-nama').value,
    nip    : document.getElementById('edit-guru-nip').value,
    email  : document.getElementById('edit-guru-email').value,
    status : document.getElementById('edit-guru-status').value,
  };
  const res = await fetch(`/api/guru/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const result = await res.json();
  alert(result.message);
  window.closeModal('modal-guru');
  window.loadGuru();
};
