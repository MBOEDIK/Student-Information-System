const pool = require('../config/db');
const responseHelper = require('../shared/response');

const createKesehatan = async (req, res) => {
  try {
    const { siswa_id, keluhan, tindakan, catatan } = req.body;
    
    if (!siswa_id || !keluhan || !tindakan) {
      return responseHelper.error(res, 'Data tidak lengkap', 400);
    }

    // Menggunakan Parameterized Query & Nama Tabel Jamak (Plural)
    await pool.query(
      'INSERT INTO kesehatan (siswa_id, keluhan, tindakan, catatan) VALUES (?, ?, ?, ?)',
      [siswa_id, keluhan, tindakan, catatan]
    );

    return responseHelper.success(res, null, 'Catatan kesehatan berhasil disimpan', 201);
  } catch (err) {
    console.error('[KESEHATAN CONTROLLER] createKesehatan:', err.message);
    return responseHelper.error(res, 'Gagal menyimpan catatan kesehatan', 500);
  }
};

module.exports = { createKesehatan };