const db = require('../config/database');

const createKesehatan = async (req, res) => {
  try {
    const { siswa_id, keluhan, tindakan, catatan } = req.body;
    
    if (!siswa_id || !keluhan || !tindakan) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    await db.query(
      'INSERT INTO kesehatan (siswa_id, keluhan, tindakan, catatan) VALUES (?, ?, ?, ?)',
      [siswa_id, keluhan, tindakan, catatan]
    );

    res.status(201).json({ success: true, message: 'Catatan kesehatan berhasil disimpan' });
  } catch (err) {
    console.error('[BACKEND] createKesehatan:', err.message);
    res.status(500).json({ success: false, message: 'Server eror' });
  }
};

module.exports = { createKesehatan };