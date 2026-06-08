const db = require('../config/db');

const createAbsensi = async (req, res, next) => {
  try {
    const { siswa_id, status, keterangan } = req.body;

    if (!siswa_id || !status) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    await db.query(
      'INSERT INTO absensi (siswa_id, status, keterangan) VALUES (?, ?, ?)',
      [siswa_id, status, keterangan]
    );

    return res.status(201).json({ success: true, message: 'Data absensi berhasil disimpan' });
  } catch (err) {
    console.error('Error Fetch: [absensiController]', err.message);
    return next(err);
  }
};

module.exports = { createAbsensi };