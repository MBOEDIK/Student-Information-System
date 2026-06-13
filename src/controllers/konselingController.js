const pool = require('../config/db');
const responseHelper = require('../shared/response');

const createKonseling = async (req, res) => {
  try {
    const { siswa_id, guru_id, catatan_konseling } = req.body;

    if (!siswa_id || !guru_id || !catatan_konseling) {
      return responseHelper.error(res, 'Data tidak lengkap', 400);
    }

    await pool.query(
      'INSERT INTO counseling_records (siswa_id, guru_id, catatan_konseling, tanggal_konseling) VALUES (?, ?, ?, NOW())',
      [siswa_id, guru_id, catatan_konseling]
    );

    return responseHelper.success(res, null, 'Catatan konseling berhasil disimpan', 201);
  } catch (err) {
    console.error('[KONSELING_CONTROLLER] createKonseling:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data', 500);
  }
};

const getRiwayatKonseling = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, siswa_id, guru_id, catatan_konseling, tanggal_konseling FROM counseling_records ORDER BY tanggal_konseling DESC'
    );

    return responseHelper.success(res, rows, 'Data berhasil diambil', 200);
  } catch (err) {
    console.error('[KONSELING_CONTROLLER] getRiwayatKonseling:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data', 500);
  }
};

module.exports = {
  createKonseling,
  getRiwayatKonseling
};