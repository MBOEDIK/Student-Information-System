const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.getJadwalGuru = async (req, res) => {
  const { nip } = req.query;

  if (!nip || !nip.trim()) {
    return responseHelper.error(res, 'Parameter NIP tidak boleh kosong.', 400);
  }

  try {
    const [guru] = await pool.query('SELECT id FROM teachers WHERE nip = ?', [nip.trim()]);
    if (guru.length === 0) {
      return responseHelper.error(res, 'Guru dengan NIP tersebut tidak ditemukan.', 404);
    }

    const [rows] = await pool.query(
      `SELECT s.id, s.hari, s.jam_mulai, s.jam_selesai, s.ruangan, sub.nama_pelajaran
       FROM schedules s
       JOIN subjects sub ON sub.id = s.subject_id
       WHERE s.teacher_id = ?
       ORDER BY FIELD(s.hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'), s.jam_mulai ASC`,
      [guru[0].id]
    );

    return responseHelper.success(res, rows, 'Daftar jadwal guru berhasil diambil');
  } catch (err) {
    console.error('[ABSENSI] getJadwalGuru:', err.message);
    return responseHelper.error(res, 'Gagal mengambil jadwal guru.', 500);
  }
};

exports.getSiswaByJadwal = async (req, res) => {
  const { scheduleId } = req.params;

  if (!scheduleId) {
    return responseHelper.error(res, 'Parameter scheduleId tidak boleh kosong.', 400);
  }

  try {
    const [rows] = await pool.query(
      `SELECT st.id, st.nis, st.nama
       FROM students st
       JOIN schedule_students ss ON ss.student_id = st.id
       WHERE ss.schedule_id = ?
       ORDER BY st.nama ASC`,
      [scheduleId]
    );

    return responseHelper.success(res, rows, 'Daftar siswa berhasil diambil');
  } catch (err) {
    console.error('[ABSENSI] getSiswaByJadwal:', err.message);
    return responseHelper.error(res, 'Gagal mengambil daftar siswa.', 500);
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
        a.status,
        a.keterangan
      FROM absensi a
      JOIN students s ON a.student_id = s.id
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

exports.getSiswaBySchedule = async (req, res) => {
  try {
    const { schedule_id } = req.query;
    const tanggal = req.query.tanggal || new Date().toISOString().slice(0, 10);

    if (!schedule_id) {
      return responseHelper.error(res, 'Parameter schedule_id wajib diisi', 400);
    }

    const [rows] = await pool.query(
      `SELECT DISTINCT
        s.id,
        s.nis,
        s.nama,
        a.status AS status_absen,
        a.keterangan
      FROM schedule_students ss
      JOIN students s ON s.id = ss.student_id
      LEFT JOIN absensi a ON a.student_id = s.id
        AND a.schedule_id = ?
        AND a.tanggal = ?
      WHERE ss.schedule_id = ?
      ORDER BY s.nama`,
      [schedule_id, tanggal, schedule_id]
    );

    const data = rows.map((r) => ({
      id: r.id,
      nis: r.nis,
      nama: r.nama,
      status_absen: r.status_absen || null,
      keterangan: r.keterangan || null
    }));

    return responseHelper.success(res, data, 'Daftar siswa berhasil diambil');
  } catch (err) {
    console.error('[ABSENSI] getSiswaBySchedule:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};

exports.saveAbsensiBatch = async (req, res) => {
  const { schedule_id, tanggal, entries } = req.body;

  if (!schedule_id || isNaN(Number(schedule_id))) {
    return responseHelper.error(res, 'schedule_id tidak valid', 400);
  }

  if (!tanggal || !Array.isArray(entries) || entries.length === 0) {
    return responseHelper.error(res, 'Data tidak lengkap', 400);
  }

  const validStatus = ['Hadir', 'Sakit', 'Izin', 'Alpa'];

  for (const entry of entries) {
    const { student_id, status } = entry;

    if (!student_id || !status) {
      return responseHelper.error(res, 'Setiap entri harus memiliki student_id dan status', 400);
    }

    if (!validStatus.includes(status)) {
      return responseHelper.error(res, 'Status tidak valid', 400);
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const entry of entries) {
      const { student_id, status, keterangan } = entry;

      const [existing] = await conn.query(
        `SELECT id FROM absensi
         WHERE student_id = ? AND schedule_id = ? AND tanggal = ?
         LIMIT 1`,
        [student_id, schedule_id, tanggal]
      );

      if (existing.length > 0) {
        await conn.query('UPDATE absensi SET status = ?, keterangan = ? WHERE id = ?', [
          status,
          keterangan || null,
          existing[0].id
        ]);
      } else {
        await conn.query(
          'INSERT INTO absensi (student_id, schedule_id, tanggal, status, keterangan) VALUES (?, ?, ?, ?, ?)',
          [student_id, schedule_id, tanggal, status, keterangan || null]
        );
      }
    }

    await conn.commit();
    return responseHelper.success(res, null, 'Data absensi berhasil disimpan');
  } catch (err) {
    await conn.rollback();
    console.error('[ABSENSI] saveAbsensiBatch:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  } finally {
    conn.release();
  }
};
