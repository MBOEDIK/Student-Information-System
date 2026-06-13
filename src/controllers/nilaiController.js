const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.getMapelGuru = async (req, res) => {
  try {
    const { nip } = req.query;

    if (!nip) {
      return responseHelper.error(res, 'NIP guru wajib diisi', 400);
    }

    const [rows] = await pool.query(
      `SELECT DISTINCT sub.id, sub.nama_pelajaran
       FROM schedules s
       JOIN subjects sub ON s.subject_id = sub.id
       JOIN teachers t ON s.teacher_id = t.id
       WHERE t.nip = ?
       ORDER BY sub.nama_pelajaran ASC`,
      [nip]
    );

    return responseHelper.success(res, rows, 'Daftar mata pelajaran berhasil diambil');
  } catch (err) {
    console.error('[NILAI] getMapelGuru:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};

exports.getSiswaByMapel = async (req, res) => {
  try {
    const { subject_id, nip } = req.query;

    if (!subject_id || !nip) {
      return responseHelper.error(res, 'subject_id dan NIP guru wajib diisi', 400);
    }

    const [rows] = await pool.query(
      `SELECT DISTINCT st.id AS student_id, st.nis, st.nama,
              g.tugas, g.uts, g.uas
       FROM schedule_students ss
       JOIN students st ON ss.student_id = st.id
       JOIN schedules s ON ss.schedule_id = s.id
       JOIN teachers t ON s.teacher_id = t.id
       LEFT JOIN grades g ON g.student_id = st.id
         AND g.subject_id = s.subject_id
         AND g.semester = ?
       WHERE s.subject_id = ? AND t.nip = ?
       ORDER BY st.nama ASC`,
      ['Ganjil 2025/2026', subject_id, nip]
    );

    return responseHelper.success(res, rows, 'Daftar siswa berhasil diambil');
  } catch (err) {
    console.error('[NILAI] getSiswaByMapel:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};

exports.saveNilaiBatch = async (req, res) => {
  try {
    const { subject_id, nip, semester, entries } = req.body;

    if (!subject_id || !nip || !semester || !Array.isArray(entries)) {
      return responseHelper.error(res, 'Data tidak lengkap', 400);
    }

    const [teacherRows] = await pool.query('SELECT id FROM teachers WHERE nip = ?', [nip]);
    if (teacherRows.length === 0) {
      return responseHelper.error(res, 'Guru tidak ditemukan', 404);
    }
    const teacher_id = teacherRows[0].id;

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
          errors.push('Baris ke-' + (i + 1) + ': nilai Tugas harus angka 0–100.');
        }
      }
      if (entry.uts !== undefined && entry.uts !== null && entry.uts !== '') {
        const num = Number(entry.uts);
        if (isNaN(num) || num < 0 || num > 100) {
          errors.push('Baris ke-' + (i + 1) + ': nilai UTS harus angka 0–100.');
        }
      }
      if (entry.uas !== undefined && entry.uas !== null && entry.uas !== '') {
        const num = Number(entry.uas);
        if (isNaN(num) || num < 0 || num > 100) {
          errors.push('Baris ke-' + (i + 1) + ': nilai UAS harus angka 0–100.');
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
