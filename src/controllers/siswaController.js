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
