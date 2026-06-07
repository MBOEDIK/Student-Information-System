const pool = require('../config/db');
const responseHelper = require('../shared/response');

const createAbsensi = async (req, res) => {
  try {
    const { siswa_id, status, keterangan } = req.body;

    if (!siswa_id || !status) {
      return responseHelper.error(res, 'Data tidak lengkap', 400);
    }

    // Menggunakan Parameterized Query & Nama Tabel Jamak (Plural) 'schedules' / 'students'
    await pool.query(
      'INSERT INTO absensi (siswa_id, status, keterangan) VALUES (?, ?, ?)',
      [siswa_id, status, keterangan]
    );

    return responseHelper.success(res, null, 'Data absensi berhasil disimpan', 201);
  } catch (err) {
    console.error('[ABSENSI CONTROLLER] createAbsensi:', err.message);
    return responseHelper.error(res, 'Gagal menyimpan data absensi', 500);
  }
};

module.exports = { createAbsensi };