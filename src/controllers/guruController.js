const pool = require('../config/db');

exports.getAllGuru = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nip, nama, email, status, created_at FROM teachers ORDER BY created_at DESC'
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[GURU CONTROLLER] getAllGuru:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data guru.' });
  }
};

exports.getGuruById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nip, nama, email, status, created_at FROM teachers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Guru tidak ditemukan.' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[GURU CONTROLLER] getGuruById:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data guru.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM teachers');
    const [[{ aktif }]] = await pool.query('SELECT COUNT(*) AS aktif FROM teachers WHERE status = ?', ['aktif']);
    return res.json({ success: true, data: { total, aktif } });
  } catch (err) {
    console.error('[GURU CONTROLLER] getStats:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil statistik guru.' });
  }
};

exports.updateGuru = async (req, res) => {
  const { id } = req.params;
  const { nama, nip, email, status } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE teachers SET nama=?, nip=?, email=?, status=? WHERE id=?',
      [nama, nip, email, status, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Guru tidak ditemukan.' });
    return res.json({ success: true, message: 'Data guru berhasil diupdate.' });
  } catch (err) {
    console.error('[GURU CONTROLLER] updateGuru:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengupdate data guru.' });
  }
};

exports.toggleStatusGuru = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['aktif', 'tidak aktif'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid.' });
    }
    const [result] = await pool.query(
      'UPDATE teachers SET status = ? WHERE id = ?',
      [status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Guru tidak ditemukan.' });
    }
    return res.json({ success: true, data: { id, status }, message: 'Status guru berhasil diperbarui.' });
  } catch (err) {
    console.error('[GURU CONTROLLER] toggleStatusGuru:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal mengubah status guru.' });
  }
};
