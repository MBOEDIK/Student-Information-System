const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.getAllSiswa = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nis, nama FROM students WHERE status = ? ORDER BY nama',
      ['aktif']
    );

    return responseHelper.success(res, rows, 'Daftar siswa berhasil diambil');
  } catch (err) {
    console.error('[KESEHATAN] getAllSiswa:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};

exports.createKesehatan = async (req, res) => {
  try {
    const { student_id, golongan_darah, penyakit_bawaan, riwayat_vaksin, alergi } = req.body;

    if (!student_id) {
      return responseHelper.error(res, 'Data tidak lengkap', 400);
    }

    const [existing] = await pool.query('SELECT id FROM health_records WHERE student_id = ?', [
      student_id
    ]);

    if (existing.length > 0) {
      return responseHelper.error(
        res,
        'Data kesehatan untuk siswa ini sudah ada. Silakan gunakan fitur edit.',
        409
      );
    }

    await pool.query(
      'INSERT INTO health_records (student_id, golongan_darah, penyakit_bawaan, riwayat_vaksin, alergi) VALUES (?, ?, ?, ?, ?)',
      [
        student_id,
        golongan_darah || null,
        penyakit_bawaan || null,
        riwayat_vaksin || null,
        alergi || null
      ]
    );

    return responseHelper.success(res, null, 'Catatan kesehatan berhasil disimpan', 201);
  } catch (err) {
    console.error('[KESEHATAN] createKesehatan:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};

exports.getAllKesehatan = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT hr.id, hr.student_id, s.nis, s.nama,
              s.nama_wali, s.no_hp_wali,
              hr.golongan_darah, hr.penyakit_bawaan, hr.riwayat_vaksin, hr.alergi,
              hr.updated_at
       FROM health_records hr
       JOIN students s ON s.id = hr.student_id
       ORDER BY s.nama ASC`
    );
    return responseHelper.success(res, rows, 'Data kesehatan berhasil diambil');
  } catch (err) {
    console.error('[KESEHATAN] getAllKesehatan:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data kesehatan', 500);
  }
};

exports.getKesehatanBySiswaId = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT hr.id, hr.student_id, s.nis, s.nama,
              hr.golongan_darah, hr.penyakit_bawaan, hr.riwayat_vaksin, hr.alergi,
              hr.updated_at
       FROM health_records hr
       JOIN students s ON s.id = hr.student_id
       WHERE hr.student_id = ?`,
      [req.params.studentId]
    );
    if (rows.length === 0) {
      return responseHelper.error(res, 'Data kesehatan tidak ditemukan', 404);
    }
    return responseHelper.success(res, rows[0], 'Data kesehatan berhasil diambil');
  } catch (err) {
    console.error('[KESEHATAN] getKesehatanBySiswaId:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data kesehatan', 500);
  }
};

exports.updateKesehatan = async (req, res) => {
  try {
    const { golongan_darah, penyakit_bawaan, riwayat_vaksin, alergi } = req.body;
    const { studentId } = req.params;

    const [existing] = await pool.query('SELECT id FROM health_records WHERE student_id = ?', [
      studentId
    ]);
    if (existing.length === 0) {
      return responseHelper.error(
        res,
        'Data kesehatan tidak ditemukan. Silakan buat data baru terlebih dahulu.',
        404
      );
    }

    await pool.query(
      `UPDATE health_records
       SET golongan_darah = ?, penyakit_bawaan = ?, riwayat_vaksin = ?, alergi = ?
       WHERE student_id = ?`,
      [
        golongan_darah || 'Tidak Diketahui',
        penyakit_bawaan || '',
        riwayat_vaksin || '',
        alergi || '',
        studentId
      ]
    );

    return responseHelper.success(res, null, 'Data kesehatan berhasil diperbarui');
  } catch (err) {
    console.error('[KESEHATAN] updateKesehatan:', err.message);
    return responseHelper.error(res, 'Gagal memperbarui data kesehatan', 500);
  }
};

exports.getKontakDarurat = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.nis, s.nama, s.nama_wali, s.no_hp_wali,
              hr.penyakit_bawaan, hr.alergi
       FROM students s
       LEFT JOIN health_records hr ON hr.student_id = s.id
       WHERE s.id = ?`,
      [req.params.studentId]
    );
    if (!rows.length) {
      return responseHelper.error(res, 'Siswa tidak ditemukan', 404);
    }
    return responseHelper.success(res, rows[0], 'Data kontak darurat berhasil diambil');
  } catch (err) {
    console.error('[KESEHATAN] getKontakDarurat:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};
