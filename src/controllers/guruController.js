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
