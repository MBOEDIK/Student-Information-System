const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.searchSiswa = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    if (!keyword || !keyword.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Kata kunci pencarian tidak boleh kosong.' });
    }
    const [rows] = await pool.query(
      'SELECT id, nis, nama, jenis_kelamin, alamat, status, created_at FROM students WHERE nama LIKE ? OR nis LIKE ? ORDER BY created_at DESC',
      [`%${keyword}%`, `%${keyword}%`]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[SISWA CONTROLLER] searchSiswa:', err);
    return res.status(500).json({ success: false, message: 'Gagal mencari data siswa.' });
  }
};

exports.getAllSiswa = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nis, nama, jenis_kelamin, alamat, status, created_at FROM students ORDER BY created_at DESC'
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[SISWA CONTROLLER] getAllSiswa:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data siswa.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM students');
    const [[{ aktif }]] = await pool.query(
      'SELECT COUNT(*) AS aktif FROM students WHERE status = ?',
      ['aktif']
    );
    return res.json({ success: true, data: { total, aktif } });
  } catch (err) {
    console.error('[SISWA CONTROLLER] getStats:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil statistik siswa.' });
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
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal.',
      errors
    });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM students WHERE nis = ?', [nis.trim()]);

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

exports.getSiswaById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nis, nama, jenis_kelamin, alamat, status, created_at FROM students WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan.' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[SISWA CONTROLLER] getSiswaById:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data siswa.' });
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
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan.' });
    return res.json({ success: true, message: 'Data siswa berhasil diupdate.' });
  } catch (err) {
    console.error('[SISWA CONTROLLER] updateSiswa:', err);
    return res.status(500).json({ success: false, message: 'Gagal mengupdate data siswa.' });
  }
};

exports.uploadSiswaCSV = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return responseHelper.error(res, 'Tidak ada data siswa yang diupload.', 400);
    }

    const allErrors = [];
    const validEntries = [];

    for (let i = 0; i < entries.length; i++) {
      const row = entries[i];
      const lineNum = i + 1;
      const rowErrors = [];

      const nis = (row.nis || '').toString().trim();
      const nama = (row.nama || '').toString().trim();
      const jenisKelamin = (row.jenis_kelamin || row.jenisKelamin || '').toString().trim();
      const alamat = (row.alamat || '').toString().trim();

      if (!nis) rowErrors.push('NIS tidak boleh kosong.');
      if (!nama) rowErrors.push('Nama tidak boleh kosong.');
      if (jenisKelamin && !['Laki-laki', 'Perempuan'].includes(jenisKelamin)) {
        rowErrors.push('Jenis Kelamin harus Laki-laki atau Perempuan.');
      }

      if (rowErrors.length > 0) {
        allErrors.push({ baris: lineNum, nis, errors: rowErrors });
        continue;
      }

      validEntries.push({
        nis,
        nama,
        jenis_kelamin: jenisKelamin || 'Laki-laki',
        alamat: alamat || null
      });
    }

    if (validEntries.length === 0) {
      return responseHelper.error(res, 'Semua baris data gagal validasi.', 400, allErrors);
    }

    const inserted = [];
    const duplicateErrors = [];

    for (const entry of validEntries) {
      try {
        const [existing] = await pool.query('SELECT id FROM students WHERE nis = ?', [entry.nis]);
        if (existing.length > 0) {
          duplicateErrors.push({ nis: entry.nis, errors: [`NIS "${entry.nis}" sudah terdaftar.`] });
          continue;
        }

        const [result] = await pool.query(
          "INSERT INTO students (nis, nama, jenis_kelamin, alamat, status) VALUES (?, ?, ?, ?, 'aktif')",
          [entry.nis, entry.nama, entry.jenis_kelamin, entry.alamat]
        );
        inserted.push({ id: result.insertId, ...entry });
      } catch (err) {
        console.error('[SISWA] uploadSiswaCSV insert:', err.message);
        duplicateErrors.push({ nis: entry.nis, errors: ['Gagal menyimpan data.'] });
      }
    }

    const summary = {
      total: entries.length,
      berhasil: inserted.length,
      gagal_validasi: allErrors.length,
      gagal_duplikat: duplicateErrors.length,
      errors: [...allErrors, ...duplicateErrors]
    };

    if (inserted.length === 0) {
      return responseHelper.error(
        res,
        'Tidak ada data yang berhasil diupload.',
        400,
        summary.errors
      );
    }

    return responseHelper.success(res, summary, `${inserted.length} data siswa berhasil diupload.`);
  } catch (err) {
    console.error('[SISWA] uploadSiswaCSV:', err.message);
    return responseHelper.error(res, 'Gagal memproses upload CSV.', 500);
  }
};
