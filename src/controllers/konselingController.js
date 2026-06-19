const pool = require('../config/db');
const responseHelper = require('../shared/response');

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS counseling_records (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        student_id    INT NOT NULL,
        teacher_id    INT NOT NULL,
        tanggal       DATE NOT NULL DEFAULT (CURRENT_DATE),
        topik         VARCHAR(150) NOT NULL,
        deskripsi     TEXT,
        tindak_lanjut TEXT,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('[KONSELING] Tabel counseling_records siap.');
  } catch (err) {
    console.error('[KONSELING] Migrasi tabel counseling_records:', err.message);
  }
})();

exports.getAllSiswa = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nis, nama FROM students WHERE status = ? ORDER BY nama',
      ['aktif']
    );

    return responseHelper.success(res, rows, 'Daftar siswa berhasil diambil');
  } catch (err) {
    console.error('[KONSELING] getAllSiswa:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};

exports.createKonseling = async (req, res) => {
  try {
    const { student_id, topik, deskripsi, tindak_lanjut, tanggal } = req.body;

    if (!student_id) {
      return responseHelper.error(res, 'Siswa wajib dipilih', 400);
    }

    if (!topik || topik.trim().length < 3) {
      return responseHelper.error(res, 'Topik konseling minimal 3 karakter', 400);
    }

    const teacherId = req.session?.user?.teacher_id;
    if (!teacherId) {
      return responseHelper.error(res, 'Akun guru tidak ditemukan. Silakan login ulang.', 400);
    }

    const effectiveTanggal = tanggal || new Date().toISOString().slice(0, 10);

    await pool.query(
      `INSERT INTO counseling_records (student_id, teacher_id, tanggal, topik, deskripsi, tindak_lanjut)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        teacherId,
        effectiveTanggal,
        topik.trim(),
        deskripsi || null,
        tindak_lanjut || null
      ]
    );

    return responseHelper.success(res, null, 'Catatan konseling berhasil disimpan', 201);
  } catch (err) {
    console.error('[KONSELING] createKonseling:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};

exports.getAllKonseling = async (req, res) => {
  try {
    const { student_id } = req.query;
    let query = `
      SELECT cr.id, cr.tanggal, cr.topik, cr.deskripsi, cr.tindak_lanjut,
             s.id AS siswa_id, s.nis, s.nama AS nama_siswa,
             t.nama AS nama_guru
      FROM counseling_records cr
      JOIN students s ON cr.student_id = s.id
      JOIN teachers t ON cr.teacher_id = t.id
    `;
    const params = [];
    if (student_id) {
      query += ' WHERE cr.student_id = ?';
      params.push(student_id);
    }
    query += ' ORDER BY cr.tanggal DESC, cr.created_at DESC';

    const [rows] = await pool.query(query, params);
    return responseHelper.success(res, rows, 'Riwayat konseling berhasil diambil');
  } catch (err) {
    console.error('[KONSELING] getAllKonseling:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data', 500);
  }
};

exports.getKonselingById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cr.id, cr.tanggal, cr.topik, cr.deskripsi, cr.tindak_lanjut,
              s.id AS siswa_id, s.nis, s.nama AS nama_siswa,
              t.nama AS nama_guru
       FROM counseling_records cr
       JOIN students s ON cr.student_id = s.id
       JOIN teachers t ON cr.teacher_id = t.id
       WHERE cr.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return responseHelper.error(res, 'Catatan konseling tidak ditemukan', 404);
    }

    return responseHelper.success(res, rows[0], 'Data berhasil diambil');
  } catch (err) {
    console.error('[KONSELING] getKonselingById:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data', 500);
  }
};
