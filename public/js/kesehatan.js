async function saveKesehatan(event) {
  event.preventDefault();
  try {
    const siswaId = document.getElementById('siswa-id').value;
    const keluhan = document.getElementById('keluhan').value;
    const tindakan = document.getElementById('tindakan').value;
    const catatan = document.getElementById('catatan').value;

    const response = await fetch('/api/kesehatan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ siswa_id: siswaId, keluhan: keluhan, tindakan: tindakan, catatan: catatan })
    });
    const result = await response.json();

    if (result.success) {
      alert('Catatan kesehatan berhasil disimpan!');
    }
  } catch (err) {
    console.error('[FRONTEND] saveKesehatan:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const formElement = document.getElementById('form-kesehatan');
  if (formElement) {
    formElement.addEventListener('submit', saveKesehatan);
  }
});