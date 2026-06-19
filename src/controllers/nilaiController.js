'use strict';

const pool = require('../config/db');
const responseHelper = require('../shared/response');

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        student_id    INT NOT NULL,
        subject_id    INT NOT NULL,
        teacher_id    INT NOT NULL,
        semester      VARCHAR(20) NOT NULL DEFAULT 'Ganjil 2025/2026',
        tugas         DECIMAL(5,2) DEFAULT NULL,
        uts           DECIMAL(5,2) DEFAULT NULL,
        uas           DECIMAL(5,2) DEFAULT NULL,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
        UNIQUE KEY uq_grade_siswa_mapel_semester (student_id, subject_id, semester)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('[NILAI] Tabel grades siap.');
  } catch (err) {
    console.error('[NILAI] Migrasi tabel grades:', err.message);
  }
})();

exports.getMapelGuru = async (req, res) => {
  try {
    const { teacher_id } = req.query;

    if (!teacher_id) {
      return responseHelper.error(res, 'teacher_id wajib diisi', 400);
    }

    const [rows] = await pool.query(
      `SELECT DISTINCT sub.id, sub.nama_pelajaran
       FROM schedules s
       JOIN subjects sub ON s.subject_id = sub.id
       WHERE s.teacher_id = ?
       ORDER BY sub.nama_pelajaran ASC`,
      [teacher_id]
    );

    return responseHelper.success(res, rows, 'Daftar mata pelajaran berhasil diambil');
  } catch (err) {
    console.error('[NILAI] getMapelGuru:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};

exports.getSiswaByMapel = async (req, res) => {
  try {
    const { subject_id, teacher_id, semester } = req.query;

    if (!subject_id || !teacher_id) {
      return responseHelper.error(res, 'subject_id dan teacher_id wajib diisi', 400);
    }

    const activeSemester = semester || 'Ganjil 2025/2026';

    const [rows] = await pool.query(
      `SELECT DISTINCT st.id AS student_id, st.nis, st.nama,
              g.tugas, g.uts, g.uas
       FROM schedule_students ss
       JOIN students st ON ss.student_id = st.id
       JOIN schedules s ON ss.schedule_id = s.id
       LEFT JOIN grades g ON g.student_id = st.id
         AND g.subject_id = s.subject_id
         AND g.semester = ?
       WHERE s.subject_id = ? AND s.teacher_id = ?
       ORDER BY st.nama ASC`,
      [activeSemester, subject_id, teacher_id]
    );

    return responseHelper.success(res, rows, 'Daftar siswa berhasil diambil');
  } catch (err) {
    console.error('[NILAI] getSiswaByMapel:', err.message);
    return responseHelper.error(
      res,
      err.sqlMessage || err.message || 'Gagal memproses permintaan',
      500
    );
  }
};

exports.saveNilaiBatch = async (req, res) => {
  try {
    const { subject_id, teacher_id, semester, entries } = req.body;

    if (!subject_id || !teacher_id || !semester || !Array.isArray(entries)) {
      return responseHelper.error(res, 'Data tidak lengkap', 400);
    }

    const errors = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry.student_id) {
        errors.push('Baris ke-' + (i + 1) + ': student_id wajib diisi.');
        continue;
      }
      if (entry.tugas !== undefined && entry.tugas !== null && entry.tugas !== '') {
        const num = Number(entry.tugas);
        if (isNaN(num) || num < 0 || num > 100) {
          errors.push('Baris ke-' + (i + 1) + ': nilai Tugas harus angka 0\u2013100.');
        }
      }
      if (entry.uts !== undefined && entry.uts !== null && entry.uts !== '') {
        const num = Number(entry.uts);
        if (isNaN(num) || num < 0 || num > 100) {
          errors.push('Baris ke-' + (i + 1) + ': nilai UTS harus angka 0\u2013100.');
        }
      }
      if (entry.uas !== undefined && entry.uas !== null && entry.uas !== '') {
        const num = Number(entry.uas);
        if (isNaN(num) || num < 0 || num > 100) {
          errors.push('Baris ke-' + (i + 1) + ': nilai UAS harus angka 0\u2013100.');
        }
      }
    }

    if (errors.length > 0) {
      return responseHelper.error(res, 'Validasi gagal.', 400, errors);
    }

    const insertQuery = `INSERT INTO grades (student_id, subject_id, teacher_id, semester, tugas, uts, uas)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         tugas = VALUES(tugas),
         uts = VALUES(uts),
         uas = VALUES(uas),
         updated_at = CURRENT_TIMESTAMP`;

    for (const entry of entries) {
      const tugas = entry.tugas !== undefined && entry.tugas !== '' ? entry.tugas : null;
      const uts = entry.uts !== undefined && entry.uts !== '' ? entry.uts : null;
      const uas = entry.uas !== undefined && entry.uas !== '' ? entry.uas : null;

      await pool.query(insertQuery, [
        entry.student_id,
        subject_id,
        teacher_id,
        semester,
        tugas,
        uts,
        uas
      ]);
    }

    return responseHelper.success(res, null, 'Nilai berhasil disimpan', 200);
  } catch (err) {
    console.error('[NILAI] saveNilaiBatch:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};

exports.getTranskripSiswa = async (req, res) => {
  try {
    const { nis } = req.query;
    if (!nis) {
      return responseHelper.error(res, 'Parameter NIS wajib diisi', 400);
    }
    const [rows] = await pool.query(
      `SELECT
        subq.*,
        CASE
          WHEN subq.rata_rata >= 85 THEN 'A'
          WHEN subq.rata_rata >= 70 THEN 'B'
          WHEN subq.rata_rata >= 55 THEN 'C'
          WHEN subq.rata_rata >= 40 THEN 'D'
          ELSE 'E'
        END AS grade
      FROM (
        SELECT
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
      ) subq
      ORDER BY subq.semester, subq.nama_pelajaran`,
      [nis]
    );
    return responseHelper.success(res, rows, 'Transkrip nilai berhasil diambil');
  } catch (err) {
    console.error('[NILAI] getTranskripSiswa:', err.message);
    return responseHelper.error(res, 'Gagal mengambil transkrip nilai', 500);
  }
};

exports.getTranskripAdmin = async (req, res) => {
  try {
    const { siswaId } = req.query;
    if (!siswaId) {
      return responseHelper.error(res, 'Parameter siswaId wajib diisi', 400);
    }
    const [[siswa]] = await pool.query('SELECT id, nis, nama FROM students WHERE id = ?', [
      siswaId
    ]);
    if (!siswa) {
      return responseHelper.error(res, 'Siswa tidak ditemukan', 404);
    }
    const [grades] = await pool.query(
      `SELECT
        subq.*,
        CASE
          WHEN subq.rata_rata >= 85 THEN 'A'
          WHEN subq.rata_rata >= 70 THEN 'B'
          WHEN subq.rata_rata >= 55 THEN 'C'
          WHEN subq.rata_rata >= 40 THEN 'D'
          ELSE 'E'
        END AS grade
      FROM (
        SELECT
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
      ) subq
      ORDER BY subq.semester, subq.nama_pelajaran`,
      [siswaId]
    );
    return responseHelper.success(res, { siswa, grades }, 'Transkrip admin berhasil diambil');
  } catch (err) {
    console.error('[NILAI] getTranskripAdmin:', err.message);
    return responseHelper.error(res, 'Gagal mengambil transkrip admin', 500);
  }
};
