'use strict';

const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.getTranskripSiswa = async (req, res) => {
  try {
    const { nis } = req.query;
    if (!nis) {
      return responseHelper.error(res, 'Parameter NIS wajib diisi.', 400);
    }
    const [rows] = await pool.query(
      `SELECT
        g.semester,
        sub.nama_pelajaran,
        g.tugas,
        g.uts,
        g.uas,
        ROUND(
          (COALESCE(g.tugas, 0) + COALESCE(g.uts, 0) + COALESCE(g.uas, 0)) /
          (
            CASE WHEN g.tugas IS NULL THEN 0 ELSE 1 END +
            CASE WHEN g.uts   IS NULL THEN 0 ELSE 1 END +
            CASE WHEN g.uas   IS NULL THEN 0 ELSE 1 END
          ), 2
        ) AS rata_rata
      FROM grades g
      JOIN subjects sub ON g.subject_id = sub.id
      JOIN students s   ON g.student_id = s.id
      WHERE s.nis = ?
      ORDER BY g.semester, sub.nama_pelajaran`,
      [nis]
    );
    return responseHelper.success(res, rows, 'Transkrip nilai berhasil diambil.');
  } catch (err) {
    console.error('[NILAI] getTranskripSiswa:', err.message);
    return responseHelper.error(res, 'Gagal mengambil transkrip nilai.', 500);
  }
};

exports.getTranskripAdmin = async (req, res) => {
  try {
    const { siswaId } = req.query;
    if (!siswaId) {
      return responseHelper.error(res, 'Parameter siswaId wajib diisi.', 400);
    }
    const [[siswa]] = await pool.query('SELECT id, nis, nama FROM students WHERE id = ?', [
      siswaId
    ]);
    if (!siswa) {
      return responseHelper.error(res, 'Siswa tidak ditemukan.', 404);
    }
    const [grades] = await pool.query(
      `SELECT
        g.semester,
        sub.nama_pelajaran,
        g.tugas,
        g.uts,
        g.uas,
        ROUND(
          (COALESCE(g.tugas, 0) + COALESCE(g.uts, 0) + COALESCE(g.uas, 0)) /
          (
            CASE WHEN g.tugas IS NULL THEN 0 ELSE 1 END +
            CASE WHEN g.uts   IS NULL THEN 0 ELSE 1 END +
            CASE WHEN g.uas   IS NULL THEN 0 ELSE 1 END
          ), 2
        ) AS rata_rata
      FROM grades g
      JOIN subjects sub ON g.subject_id = sub.id
      WHERE g.student_id = ?
      ORDER BY g.semester, sub.nama_pelajaran`,
      [siswaId]
    );
    return responseHelper.success(res, { siswa, grades }, 'Transkrip admin berhasil diambil.');
  } catch (err) {
    console.error('[NILAI] getTranskripAdmin:', err.message);
    return responseHelper.error(res, 'Gagal mengambil transkrip admin.', 500);
  }
};
