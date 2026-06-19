const pool = require('../config/db');
const crypto = require('crypto');
const responseHelper = require('../shared/response');

exports.getAllGuru = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nip, nama, email, status, created_at FROM teachers ORDER BY created_at DESC'
    );
    return responseHelper.success(res, rows, 'Data berhasil diambil');
  } catch (err) {
    console.error('[GURU] getAllGuru:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data guru.', 500);
  }
};

exports.getGuruById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nip, nama, email, status, created_at FROM teachers WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return responseHelper.error(res, 'Guru tidak ditemukan.', 404);
    return responseHelper.success(res, rows[0], 'Data berhasil diambil');
  } catch (err) {
    console.error('[GURU] getGuruById:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data guru.', 500);
  }
};

exports.getStats = async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM teachers');
    const [[{ aktif }]] = await pool.query(
      'SELECT COUNT(*) AS aktif FROM teachers WHERE status = ?',
      ['aktif']
    );
    return responseHelper.success(res, { total, aktif }, 'Statistik berhasil diambil');
  } catch (err) {
    console.error('[GURU] getStats:', err.message);
    return responseHelper.error(res, 'Gagal mengambil statistik guru.', 500);
  }
};

exports.createGuru = async (req, res) => {
  const { nip, nama, email, status } = req.body;

  const errors = [];

  if (!nip || !nip.trim()) {
    errors.push('NIP tidak boleh kosong.');
  }

  if (!nama || !nama.trim()) {
    errors.push('Nama tidak boleh kosong.');
  }

  if (errors.length > 0) {
    return responseHelper.error(res, 'Validasi gagal.', 400, errors);
  }

  let conn;
  try {
    const [existing] = await pool.query('SELECT id FROM teachers WHERE nip = ?', [nip.trim()]);
    if (existing.length > 0) {
      return responseHelper.error(res, `NIP "${nip}" sudah terdaftar di sistem.`, 409, [
        `NIP "${nip}" sudah terdaftar.`
      ]);
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [teacherResult] = await conn.query(
      'INSERT INTO teachers (nip, nama, email, status) VALUES (?, ?, ?, ?)',
      [nip.trim(), nama.trim(), email?.trim() || null, status || 'aktif']
    );

    const passwordHash = crypto.createHash('sha256').update('guru123').digest('hex');

    await conn.query(
      'INSERT INTO users (username, password, role, nama_lengkap) VALUES (?, ?, ?, ?)',
      [nip.trim(), passwordHash, 'guru', nama.trim()]
    );

    await conn.commit();

    return responseHelper.success(
      res,
      {
        id: teacherResult.insertId,
        nip: nip.trim(),
        nama: nama.trim(),
        email: email?.trim() || null,
        status: status || 'aktif'
      },
      'Data guru berhasil didaftarkan. Akun login telah dibuat.',
      201
    );
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('[GURU] createGuru:', err.message);
    return responseHelper.error(res, 'Gagal mendaftarkan guru.', 500);
  } finally {
    if (conn) conn.release();
  }
};

exports.updateGuru = async (req, res) => {
  const { id } = req.params;
  const { nama, nip, email, status } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE teachers SET nama=?, nip=?, email=?, status=? WHERE id=?',
      [nama, nip, email, status, id]
    );
    if (result.affectedRows === 0) return responseHelper.error(res, 'Guru tidak ditemukan.', 404);
    return responseHelper.success(res, null, 'Data guru berhasil diupdate.');
  } catch (err) {
    console.error('[GURU] updateGuru:', err.message);
    return responseHelper.error(res, 'Gagal mengupdate data guru.', 500);
  }
};
