const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.createAbsensi = async (req, res) => {
  try {
    const { siswa_id, status, keterangan } = req.body;

    if (!siswa_id || !status) {
      return responseHelper.error(res, 'Data tidak lengkap', 400);
    }

    await pool.query('INSERT INTO absensi (siswa_id, status, keterangan) VALUES (?, ?, ?)', [
      siswa_id,
      status,
      keterangan
    ]);

    return responseHelper.success(res, null, 'Data absensi berhasil disimpan', 201);
  } catch (err) {
    console.error('[ABSENSI] createAbsensi:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};
