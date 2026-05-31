const pool = require('../config/db');

exports.getAllGuru = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM teachers');
    res.json(rows);
  } catch (err) {
    console.error('[GURU CONTROLLER]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data guru.' });
  }
};

exports.getGuruById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Guru tidak ditemukan.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[GURU CONTROLLER]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data guru.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) AS total FROM teachers');
    const [aktif] = await pool.query("SELECT COUNT(*) AS aktif FROM teachers WHERE status = 'aktif'");
    res.json({
      success: true,
      data: { total: total[0].total, aktif: aktif[0].aktif }
    });
  } catch (err) {
    console.error('[GURU CONTROLLER]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik.' });
  }
};

exports.updateGuru = async (req, res) => {
  const { id } = req.params;
  const { nama, nip, mata_pelajaran, alamat, status } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE teachers SET nama=?, nip=?, mata_pelajaran=?, alamat=?, status=? WHERE id=?',
      [nama, nip, mata_pelajaran, alamat, status, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Guru tidak ditemukan.' });
    res.json({ success: true, message: 'Data guru berhasil diupdate.' });
  } catch (err) {
    console.error('[GURU CONTROLLER]', err);
    res.status(500).json({ success: false, message: 'Gagal mengupdate data guru.' });
  }
};
