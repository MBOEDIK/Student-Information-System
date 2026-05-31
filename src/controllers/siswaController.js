const pool = require('../config/db');

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
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal.',
      errors
    });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM students WHERE nis = ?',
      [nis.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `NIS "${nis}" sudah terdaftar di sistem.`,
        errors: [`NIS "${nis}" sudah terdaftar.`]
      });
    }

    const [result] = await pool.query(
      `INSERT INTO students (nis, nama, jenis_kelamin, alamat, status)
       VALUES (?, ?, ?, ?, 'aktif')`,
      [nis.trim(), nama.trim(), jenis_kelamin.trim(), alamat.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Data siswa baru berhasil didaftarkan.',
      data: {
        id: result.insertId,
        nis: nis.trim(),
        nama: nama.trim(),
        jenis_kelamin: jenis_kelamin.trim(),
        alamat: alamat.trim(),
        status: 'aktif'
      }
    });
  } catch (err) {
    console.error('[SISWA CONTROLLER]', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

exports.getAllSiswa = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students');
    res.json(rows);
  } catch (err) {
    console.error('[SISWA CONTROLLER]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data siswa.' });
  }
};

exports.getSiswaById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[SISWA CONTROLLER]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data siswa.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) AS total FROM students');
    const [aktif] = await pool.query("SELECT COUNT(*) AS aktif FROM students WHERE status = 'aktif'");
    res.json({
      success: true,
      data: { total: total[0].total, aktif: aktif[0].aktif }
    });
  } catch (err) {
    console.error('[SISWA CONTROLLER]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik.' });
  }
};

exports.updateSiswa = async (req, res) => {
  const { id } = req.params;
  const { nama, nis, kelas, alamat, status } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE students SET nama=?, nis=?, kelas=?, alamat=?, status=? WHERE id=?',
      [nama, nis, kelas, alamat, status, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan.' });
    res.json({ success: true, message: 'Data siswa berhasil diupdate.' });
  } catch (err) {
    console.error('[SISWA CONTROLLER]', err);
    res.status(500).json({ success: false, message: 'Gagal mengupdate data siswa.' });
  }
};
