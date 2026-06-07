const pool = require('../config/database');
const responseHelper = require('../shared/response');

const getAllKesehatan = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medical_records ORDER BY id DESC');
    return responseHelper.success(res, rows, 'Data rekam medis berhasil diambil', 200);
  } catch (err) {
    console.error('[KESEHATAN] getAllKesehatan:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data rekam medis', 500);
  }
};

const createKesehatan = async (req, res) => {
  try {
    const { siswa_id, keluhan, tindakan, catatan } = req.body;
    const query = 'INSERT INTO medical_records (siswa_id, keluhan, tindakan, catatan) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(query, [siswa_id, keluhan, tindakan, catatan]);
    const data = { id: result.insertId, siswa_id, keluhan, tindakan, catatan };
    return responseHelper.success(res, data, 'Catatan kesehatan berhasil disimpan', 201);
  } catch (err) {
    console.error('[KESEHATAN] createKesehatan:', err.message);
    return responseHelper.error(res, 'Gagal menyimpan catatan kesehatan', 500);
  }
};

module.exports = {
  getAllKesehatan,
  createKesehatan
};