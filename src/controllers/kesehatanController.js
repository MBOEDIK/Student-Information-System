const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.createKesehatan = async (req, res) => {
  try {
    const { siswa_id, keluhan, tindakan, catatan } = req.body;

    if (!siswa_id || !keluhan || !tindakan) {
      return responseHelper.error(res, 'Data tidak lengkap', 400);
    }

    await pool.query(
      'INSERT INTO health_records (siswa_id, keluhan, tindakan, catatan) VALUES (?, ?, ?, ?)',
      [siswa_id, keluhan, tindakan, catatan]
    );

    return responseHelper.success(res, null, 'Catatan kesehatan berhasil disimpan', 201);
  } catch (err) {
    console.error('[KESEHATAN] createKesehatan:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};
