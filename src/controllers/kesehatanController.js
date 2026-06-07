const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.getAllKesehatan = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT hr.id, hr.student_id, s.nis, s.nama,
             hr.golongan_darah, hr.penyakit_bawaan, hr.riwayat_vaksin, hr.alergi,
             hr.updated_at
      FROM health_records hr
      JOIN students s ON s.id = hr.student_id
      ORDER BY s.nama ASC
    `);
    return responseHelper.success(res, rows, 'Data kesehatan berhasil diambil');
  } catch (err) {
    console.error('[KESEHATAN] getAllKesehatan:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data kesehatan', 500);
  }
};

exports.getKesehatanBySiswaId = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT hr.id, hr.student_id, s.nis, s.nama,
             hr.golongan_darah, hr.penyakit_bawaan, hr.riwayat_vaksin, hr.alergi,
             hr.updated_at
      FROM health_records hr
      JOIN students s ON s.id = hr.student_id
      WHERE hr.student_id = ?
    `,
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
