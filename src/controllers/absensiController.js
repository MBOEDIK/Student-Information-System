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

exports.createAbsensi = async (req, res) => {
  try {
    const { schedule_id, tanggal, records } = req.body;

    if (!schedule_id || !tanggal || !records || !Array.isArray(records) || records.length === 0) {
      return responseHelper.error(
        res,
        'Data tidak lengkap. schedule_id, tanggal, dan records wajib diisi.',
        400
      );
    }

    const values = records.map(function (r) {
      return [schedule_id, r.student_id, r.status, tanggal];
    });

    await pool.query(
      `INSERT INTO absensi (schedule_id, siswa_id, status, tanggal) VALUES ?
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [values]
    );

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
        a.status,
        a.keterangan
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

exports.getSiswaBySchedule = async (req, res) => {
  try {
    const { schedule_id } = req.query;
    const tanggal = req.query.tanggal || new Date().toISOString().slice(0, 10);

    if (!schedule_id) {
      return responseHelper.error(res, 'Parameter schedule_id wajib diisi', 400);
    }

    const [rows] = await pool.query(
      `SELECT
        s.id,
        s.nis,
        s.nama,
        a.status AS status_absen,
        a.keterangan
      FROM schedule_students ss
      JOIN students s ON s.id = ss.student_id
      LEFT JOIN absensi a
        ON a.siswa_id = s.id
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

  if (!schedule_id || !tanggal || !Array.isArray(entries) || entries.length === 0) {
    return responseHelper.error(res, 'Data tidak lengkap', 400);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const entry of entries) {
      const { siswa_id, status, keterangan } = entry;

      if (!siswa_id || !status) {
        await conn.rollback();
        return responseHelper.error(res, 'Setiap entri harus memiliki siswa_id dan status', 400);
      }

      await conn.query(
        `INSERT INTO absensi (siswa_id, schedule_id, tanggal, status, keterangan)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           status = VALUES(status),
           keterangan = VALUES(keterangan)`,
        [siswa_id, schedule_id, tanggal, status, keterangan || null]
      );
    }

    await conn.commit();
    return responseHelper.success(res, null, 'Data absensi berhasil disimpan');
  } catch (err) {
    await conn.rollback();
    console.error(`[ABSENSI] saveAbsensiBatch: ${err.message}`);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  } finally {
    conn.release();
  }
};

exports.updateAbsensi = async (req, res) => {
  const { id } = req.params;

  // Validasi id params
  if (!id || isNaN(Number(id))) {
    return responseHelper.error(res, 'Parameter id tidak valid', 400);
  }

  // Validasi body { status, keterangan }
  const { status, keterangan } = req.body;

  const validStatus = ['Hadir', 'Sakit', 'Izin', 'Alpa'];
  if (!status || !validStatus.includes(status)) {
    return responseHelper.error(
      res,
      `status wajib diisi dan harus salah satu dari: ${validStatus.join(', ')}`,
      400
    );
  }

  try {
    const [result] = await pool.query(
      'UPDATE absensi SET status = ?, keterangan = ? WHERE id = ?',
      [status, keterangan || null, Number(id)]
    );

    if (result.affectedRows === 0) {
      return responseHelper.error(res, 'Data absensi tidak ditemukan', 404);
    }

    return responseHelper.success(res, null, 'Data absensi berhasil diperbarui');
  } catch (err) {
    console.error('[ABSENSI] updateAbsensi:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};
