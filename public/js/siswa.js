// Muat semua data siswa saat halaman terbuka
async function loadSiswa() {
  const res = await fetch('/api/siswa');
  const data = await res.json();
  const tbody = document.getElementById('body-siswa');
  tbody.innerHTML = '';
  data.forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td>${s.id}</td>
        <td>${s.nama}</td>
        <td>${s.nis}</td>
        <td>${s.kelas}</td>
        <td>${s.alamat}</td>
        <td>${s.status}</td>
        <td><button onclick="editSiswa(${s.id})">Edit</button></td>
      </tr>`;
  });
}

// Buka modal edit dan isi data lama
async function editSiswa(id) {
  const res = await fetch(`/api/siswa/${id}`);
  const s = await res.json();
  document.getElementById('edit-siswa-id').value    = s.id;
  document.getElementById('edit-siswa-nama').value  = s.nama;
  document.getElementById('edit-siswa-nis').value   = s.nis;
  document.getElementById('edit-siswa-kelas').value = s.kelas;
  document.getElementById('edit-siswa-alamat').value= s.alamat;
  document.getElementById('edit-siswa-status').value= s.status;
  document.getElementById('modal-siswa').style.display = 'flex';
}

// Kirim data update ke backend
async function simpanSiswa() {
  const id = document.getElementById('edit-siswa-id').value;
  const body = {
    nama   : document.getElementById('edit-siswa-nama').value,
    nis    : document.getElementById('edit-siswa-nis').value,
    kelas  : document.getElementById('edit-siswa-kelas').value,
    alamat : document.getElementById('edit-siswa-alamat').value,
    status : document.getElementById('edit-siswa-status').value,
  };
  const res = await fetch(`/api/siswa/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const result = await res.json();
  alert(result.message);
  document.getElementById('modal-siswa').style.display = 'none';
  loadSiswa(); // refresh tabel
}

// Jalankan saat halaman pertama kali dibuka
loadSiswa();