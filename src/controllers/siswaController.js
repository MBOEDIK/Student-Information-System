const db = require('../config/db');

// Ambil semua data siswa
const getAllSiswa = (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Ambil data siswa berdasarkan ID
const getSiswaById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM students WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Siswa tidak ditemukan' });
    res.json(results[0]);
  });
};

// Update data siswa
const updateSiswa = (req, res) => {
  const { id } = req.params;
  const { nama, nis, kelas, alamat, status } = req.body;
  db.query(
    'UPDATE students SET nama=?, nis=?, kelas=?, alamat=?, status=? WHERE id=?',
    [nama, nis, kelas, alamat, status, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Data siswa berhasil diupdate' });
    }
  );
};

module.exports = { getAllSiswa, getSiswaById, updateSiswa };