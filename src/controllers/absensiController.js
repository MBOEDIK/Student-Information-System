const pool = require('../config/database');
const responseHelper = require('../shared/response');

const getAllAbsensi = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attendances ORDER BY id DESC');
    return responseHelper.success(res, rows, 'Data absensi berhasil diambil', 200);
  } catch (err) {
    console.error('[ABSENSI] getAllAbsensi:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data absensi', 500);
  }
};

const createAbsensi = async (req, res) => {
  try {
    const { siswa_id, status, keterangan } = req.body;
    const query = 'INSERT INTO attendances (siswa_id, status, keterangan) VALUES (?, ?, ?)';
    const [result] = await pool.query(query, [siswa_id, status, keterangan]);
    const data = { id: result.insertId, siswa_id, status, keterangan };
    return responseHelper.success(res, data, 'Absensi berhasil dicatat', 201);
  } catch (err) {
    console.error('[ABSENSI] createAbsensi:', err.message);
    return responseHelper.error(res, 'Gagal mencatat absensi', 500);
  }
};

module.exports = {
  getAllAbsensi,
  createAbsensi
};