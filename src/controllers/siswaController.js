const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.searchSiswa = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    if (!keyword || !keyword.trim()) {
      return responseHelper.error(res, 'Kata kunci pencarian tidak boleh kosong.', 400);
    }
    const [rows] = await pool.query(
      'SELECT id, nis, nama, jenis_kelamin, alamat, status, created_at FROM students WHERE nama LIKE ? OR nis LIKE ? ORDER BY created_at DESC',
      [`%${keyword}%`, `%${keyword}%`]
    );
    return responseHelper.success(res, rows, 'Data berhasil diambil');
  } catch (err) {
    console.error('[SISWA] searchSiswa:', err.message);
    return responseHelper.error(res, 'Gagal mencari data siswa.', 500);
  }
};

exports.getAllSiswa = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nis, nama, jenis_kelamin, alamat, status, created_at FROM students ORDER BY created_at DESC'
    );
    return responseHelper.success(res, rows, 'Data berhasil diambil');
  } catch (err) {
    console.error('[SISWA] getAllSiswa:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data siswa.', 500);
  }
};

exports.getStats = async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM students');
    const [[{ aktif }]] = await pool.query(
      'SELECT COUNT(*) AS aktif FROM students WHERE status = ?',
      ['aktif']
    );
    return responseHelper.success(res, { total, aktif }, 'Statistik berhasil diambil');
  } catch (err) {
    console.error('[SISWA] getStats:', err.message);
    return responseHelper.error(res, 'Gagal mengambil statistik siswa.', 500);
  }
};

exports.createSiswa = async (req, res) => {
  const { nis, nama, jenis_kelamin, alamat } = req.body;

  const errors = [];

  if (!nis || !nis.trim()) {
    errors.push('NIS tidak boleh kosong.');
  }

  if (!nama || !nama.trim()) {
    errors.push('Nama tidak boleh kosong.');
  }

  if (!jenis_kelamin || !jenis_kelamin.trim()) {
    errors.push('Jenis Kelamin harus dipilih.');
  }

  if (!alamat || !alamat.trim()) {
    errors.push('Alamat tidak boleh kosong.');
  }

  if (errors.length > 0) {
    return responseHelper.error(res, 'Validasi gagal.', 400, errors);
  }

  try {
    const [existing] = await pool.query('SELECT id FROM students WHERE nis = ?', [nis.trim()]);

    if (existing.length > 0) {
      return responseHelper.error(res, `NIS "${nis}" sudah terdaftar di sistem.`, 409, [
        `NIS "${nis}" sudah terdaftar.`
      ]);
    }

    const [result] = await pool.query(
      `INSERT INTO students (nis, nama, jenis_kelamin, alamat, status)
       VALUES (?, ?, ?, ?, 'aktif')`,
      [nis.trim(), nama.trim(), jenis_kelamin.trim(), alamat.trim()]
    );

    return responseHelper.success(
      res,
      {
        id: result.insertId,
        nis: nis.trim(),
        nama: nama.trim(),
        jenis_kelamin: jenis_kelamin.trim(),
        alamat: alamat.trim(),
        status: 'aktif'
      },
      'Data siswa baru berhasil didaftarkan.',
      201
    );
  } catch (err) {
    console.error('[SISWA] createSiswa:', err.message);
    return responseHelper.error(res, 'Terjadi kesalahan pada server.', 500);
  }
};

exports.getSiswaById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nis, nama, jenis_kelamin, alamat, status, created_at FROM students WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return responseHelper.error(res, 'Siswa tidak ditemukan.', 404);
    return responseHelper.success(res, rows[0], 'Data berhasil diambil');
  } catch (err) {
    console.error('[SISWA] getSiswaById:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data siswa.', 500);
  }
};

exports.updateSiswa = async (req, res) => {
  const { id } = req.params;
  const { nama, nis, jenis_kelamin, alamat, status } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE students SET nama=?, nis=?, jenis_kelamin=?, alamat=?, status=? WHERE id=?',
      [nama, nis, jenis_kelamin, alamat, status, id]
    );
    if (result.affectedRows === 0) return responseHelper.error(res, 'Siswa tidak ditemukan.', 404);
    return responseHelper.success(res, null, 'Data siswa berhasil diupdate.');
  } catch (err) {
    console.error('[SISWA] updateSiswa:', err.message);
    return responseHelper.error(res, 'Gagal mengupdate data siswa.', 500);
  }
};
