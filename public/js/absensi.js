async function saveAbsensi(event) {
  event.preventDefault();
  try {
    const siswaId = document.getElementById('siswa-id').value;
    const status = document.getElementById('status').value;
    const keterangan = document.getElementById('keterangan').value;

    const response = await fetch('/api/absensi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ siswa_id: siswaId, status: status, keterangan: keterangan })
    });
    const result = await response.json();

    if (result.success) {
      alert('Data absensi berhasil disimpan!');
    }
  } catch (err) {
    console.error('[FRONTEND] saveAbsensi:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const formElement = document.getElementById('form-absensi');
  if (formElement) {
    formElement.addEventListener('submit', saveAbsensi);
  }
});