async function fetchRiwayatKonseling() {
  try {
    const response = await fetch('/api/konseling');
    const result = await response.json();

    if (result.success) {
      const tbody = document.getElementById('table-riwayat-konseling');
      if (!tbody) return;

      tbody.innerHTML = '';
      result.data.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${new Date(item.tanggal_konseling).toLocaleDateString('id-ID')}</td>
          <td>${item.siswa_id}</td>
          <td>${item.guru_id}</td>
          <td>${item.catatan_konseling}</td>
        `;
        tbody.appendChild(row);
      });
    }
  } catch (err) {
    console.error('[KONSELING_FRONTEND] fetchRiwayatKonseling:', err.message);
  }
}

async function saveKonseling(event) {
  event.preventDefault();
  try {
    const siswaId = document.getElementById('siswa-id').value;
    const guruId = document.getElementById('guru-id').value;
    const catatanKonseling = document.getElementById('catatan-konseling').value;

    const response = await fetch('/api/konseling', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        siswa_id: siswaId,
        guru_id: guruId,
        catatan_konseling: catatanKonseling
      })
    });
    const result = await response.json();

    if (result.success) {
      alert('Catatan konseling berhasil disimpan!');
      document.getElementById('form-konseling').reset();
      await fetchRiwayatKonseling();
    }
  } catch (err) {
    console.error('[KONSELING_FRONTEND] saveKonseling:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const formElement = document.getElementById('form-konseling');
  if (formElement) {
    formElement.addEventListener('submit', saveKonseling);
  }
  fetchRiwayatKonseling();
});