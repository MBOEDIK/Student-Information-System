const db = require('../config/db');

// Ambil semua data guru
const getAllGuru = (req, res) => {
  db.query('SELECT * FROM teachers', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Ambil data guru berdasarkan ID
const getGuruById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM teachers WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Guru tidak ditemukan' });
    res.json(results[0]);
  });
};

// Update data guru
const updateGuru = (req, res) => {
  const { id } = req.params;
  const { nama, nip, mata_pelajaran, alamat, status } = req.body;
  db.query(
    'UPDATE teachers SET nama=?, nip=?, mata_pelajaran=?, alamat=?, status=? WHERE id=?',
    [nama, nip, mata_pelajaran, alamat, status, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Data guru berhasil diupdate' });
    }
  );
};

module.exports = { getAllGuru, getGuruById, updateGuru };