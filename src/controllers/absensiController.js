const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.createAbsensi = async (req, res) => {
  try {
    const { siswa_id, status, keterangan } = req.body;

    if (!siswa_id || !status) {
      return responseHelper.error(res, 'Data tidak lengkap', 400);
    }

    await pool.query('INSERT INTO absensi (siswa_id, status, keterangan) VALUES (?, ?, ?)', [
      siswa_id,
      status,
      keterangan
    ]);

    return responseHelper.success(res, null, 'Data absensi berhasil disimpan', 201);
  } catch (err) {
    console.error('[ABSENSI] createAbsensi:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};

exports.getLaporanHarian = async (req, res) => {
  try {
    const { tanggal } = req.query;

    if (!tanggal) {
      return responseHelper.error(res, 'Parameter tanggal wajib diisi (YYYY-MM-DD)', 400);
    }

    const [rows] = await pool.query(
      `SELECT
        a.id,
        s.nis,
        s.nama AS nama_siswa,
        sub.nama_pelajaran,
        t.nama AS nama_guru,
        a.status
      FROM absensi a
      JOIN students s ON a.siswa_id = s.id
      LEFT JOIN schedules sch ON a.schedule_id = sch.id
      LEFT JOIN subjects sub ON sch.subject_id = sub.id
      LEFT JOIN teachers t ON sch.teacher_id = t.id
      WHERE a.tanggal = ?
      ORDER BY s.nama`,
      [tanggal]
    );

    return responseHelper.success(res, rows, 'Laporan absensi harian berhasil diambil');
  } catch (err) {
    console.error('[ABSENSI] getLaporanHarian:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};

exports.getRekapHarian = async (req, res) => {
  try {
    const { tanggal } = req.query;

    if (!tanggal) {
      return responseHelper.error(res, 'Parameter tanggal wajib diisi (YYYY-MM-DD)', 400);
    }

    const [rows] = await pool.query(
      `SELECT a.status, COUNT(*) AS total
      FROM absensi a
      WHERE a.tanggal = ?
      GROUP BY a.status`,
      [tanggal]
    );

    return responseHelper.success(res, rows, 'Rekap absensi harian berhasil diambil');
  } catch (err) {
    console.error('[ABSENSI] getRekapHarian:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};
