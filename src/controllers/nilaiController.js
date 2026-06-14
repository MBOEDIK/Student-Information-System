'use strict';

const pool = require('../config/db');

exports.getTranskripSiswa = async (req, res) => {
  try {
    const { nis } = req.query;
    if (!nis) {
      return res.status(400).json({ success: false, message: 'Parameter NIS wajib diisi.' });
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
    return res.json({ success: true, data: rows, message: 'Transkrip nilai berhasil diambil.' });
  } catch (err) {
    console.error('[NILAI] getTranskripSiswa:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil transkrip nilai.' });
  }
};

exports.getTranskripAdmin = async (req, res) => {
  try {
    const { siswaId } = req.query;
    if (!siswaId) {
      return res.status(400).json({ success: false, message: 'Parameter siswaId wajib diisi.' });
    }
    const [[siswa]] = await pool.query(
      'SELECT id, nis, nama FROM students WHERE id = ?',
      [siswaId]
    );
    if (!siswa) {
      return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan.' });
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
    return res.json({ success: true, data: { siswa, grades }, message: 'Transkrip admin berhasil diambil.' });
  } catch (err) {
    console.error('[NILAI] getTranskripAdmin:', err.message);
    return res.status(500).json({ success: false, message: 'Gagal mengambil transkrip admin.' });
  }
};