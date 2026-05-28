async function loadGuru() {
  const res = await fetch('/api/guru');
  const data = await res.json();
  const tbody = document.getElementById('body-guru');
  tbody.innerHTML = '';
  data.forEach(g => {
    tbody.innerHTML += `
      <tr>
        <td>${g.id}</td>
        <td>${g.nama}</td>
        <td>${g.nip}</td>
        <td>${g.mata_pelajaran}</td>
        <td>${g.alamat}</td>
        <td>${g.status}</td>
        <td><button onclick="editGuru(${g.id})">Edit</button></td>
      </tr>`;
  });
}

async function editGuru(id) {
  const res = await fetch(`/api/guru/${id}`);
  const g = await res.json();
  document.getElementById('edit-guru-id').value    = g.id;
  document.getElementById('edit-guru-nama').value  = g.nama;
  document.getElementById('edit-guru-nip').value   = g.nip;
  document.getElementById('edit-guru-mapel').value = g.mata_pelajaran;
  document.getElementById('edit-guru-alamat').value= g.alamat;
  document.getElementById('edit-guru-status').value= g.status;
  document.getElementById('modal-guru').style.display = 'flex';
}

async function simpanGuru() {
  const id = document.getElementById('edit-guru-id').value;
  const body = {
    nama           : document.getElementById('edit-guru-nama').value,
    nip            : document.getElementById('edit-guru-nip').value,
    mata_pelajaran : document.getElementById('edit-guru-mapel').value,
    alamat         : document.getElementById('edit-guru-alamat').value,
    status         : document.getElementById('edit-guru-status').value,
  };
  const res = await fetch(`/api/guru/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const result = await res.json();
  alert(result.message);
  document.getElementById('modal-guru').style.display = 'none';
  loadGuru();
}

loadGuru();