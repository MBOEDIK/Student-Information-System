const db = require('../config/db');

const createKesehatan = async (req, res, next) => {
  try {
    const { siswa_id, keluhan, tindakan, catatan } = req.body;
    
    if (!siswa_id || !keluhan || !tindakan) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    // WAJIB: Menggunakan tabel health_records sesuai schema.sql tim
    await db.query(
      'INSERT INTO health_records (siswa_id, keluhan, tindakan, catatan) VALUES (?, ?, ?, ?)',
      [siswa_id, keluhan, tindakan, catatan]
    );

    return res.status(201).json({ success: true, message: 'Catatan kesehatan berhasil disimpan' });
  } catch (err) {
    console.error('Error Fetch: [kesehatanController]', err.message);
    return next(err);
  }
};

module.exports = { createKesehatan };