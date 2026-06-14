// src/controllers/jadwalController.js
// Menangani logika pembuatan dan pengelolaan jadwal kelas

const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.getAllSubjects = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nama_pelajaran FROM subjects ORDER BY nama_pelajaran ASC'
    );

    return responseHelper.success(res, rows, 'Daftar mata pelajaran berhasil diambil');
  } catch (err) {
    console.error('[JADWAL CONTROLLER] getAllSubjects:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data mata pelajaran', 500);
  }
};

exports.getJadwalById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.subject_id, s.teacher_id, s.hari, s.jam_mulai, s.jam_selesai, s.ruangan,
              sub.nama_pelajaran, t.nama AS nama_guru
       FROM schedules s
       JOIN subjects sub ON s.subject_id = sub.id
       JOIN teachers t ON s.teacher_id = t.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return responseHelper.error(res, 'Jadwal tidak ditemukan.', 404);
    }
    return responseHelper.success(res, rows[0], 'Data jadwal berhasil diambil');
  } catch (err) {
    console.error('[JADWAL CONTROLLER] getJadwalById:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data jadwal', 500);
  }
};

exports.getAllJadwal = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id,
              s.hari,
              s.jam_mulai,
              s.jam_selesai,
              s.ruangan,
              s.created_at,
              sub.nama_pelajaran,
              t.nama AS nama_guru
       FROM schedules s
       JOIN subjects sub ON s.subject_id = sub.id
       JOIN teachers t ON s.teacher_id = t.id
       ORDER BY FIELD(
         s.hari,
         'Senin',
         'Selasa',
         'Rabu',
         'Kamis',
         'Jumat',
         'Sabtu'
       ),
       s.jam_mulai ASC`
    );

    return responseHelper.success(res, rows, 'Daftar jadwal berhasil diambil');
  } catch (err) {
    console.error('[JADWAL CONTROLLER] getAllJadwal:', err.message);
    return responseHelper.error(res, 'Gagal mengambil data jadwal', 500);
  }
};

exports.createJadwal = async (req, res) => {
  const { subject_id, teacher_id, hari, jam_mulai, jam_selesai, ruangan } = req.body;

  const errors = [];

  if (!subject_id) errors.push('Mata pelajaran harus dipilih.');
  if (!teacher_id) errors.push('Guru pengampu harus dipilih.');
  if (!hari) errors.push('Hari harus dipilih.');
  if (!jam_mulai) errors.push('Jam mulai harus diisi.');
  if (!jam_selesai) errors.push('Jam selesai harus diisi.');
  if (!ruangan || !ruangan.trim()) {
    errors.push('Ruangan tidak boleh kosong.');
  }

  if (jam_mulai && jam_selesai && jam_mulai >= jam_selesai) {
    errors.push('Jam selesai harus lebih besar dari jam mulai.');
  }

  if (errors.length > 0) {
    return responseHelper.error(res, 'Validasi gagal.', 400, errors);
  }

  try {
    const [existingTeacher] = await pool.query(
      `SELECT id
       FROM teachers
       WHERE id = ?
       AND status = 'aktif'`,
      [teacher_id]
    );

    if (existingTeacher.length === 0) {
      return responseHelper.error(res, 'Guru tidak ditemukan atau tidak aktif.', 400, [
        'Guru tidak ditemukan atau tidak aktif.'
      ]);
    }

    const [existingSubject] = await pool.query('SELECT id FROM subjects WHERE id = ?', [
      subject_id
    ]);

    if (existingSubject.length === 0) {
      return responseHelper.error(res, 'Mata pelajaran tidak ditemukan.', 400, [
        'Mata pelajaran tidak ditemukan.'
      ]);
    }

    const validDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    if (!validDays.includes(hari)) {
      return responseHelper.error(res, 'Hari tidak valid.', 400, ['Hari tidak valid.']);
    }

    const [guruConflict] = await pool.query(
      `SELECT id
       FROM schedules
       WHERE teacher_id = ?
       AND hari = ?
       AND jam_mulai < ?
       AND jam_selesai > ?`,
      [teacher_id, hari, jam_selesai, jam_mulai]
    );

    if (guruConflict.length > 0) {
      return responseHelper.error(
        res,
        'Bentrok jadwal: Guru sudah memiliki jadwal di hari dan jam tersebut.',
        409,
        ['Guru sudah memiliki jadwal di hari dan jam yang sama.']
      );
    }

    const [roomConflict] = await pool.query(
      `SELECT id
       FROM schedules
       WHERE ruangan = ?
       AND hari = ?
       AND jam_mulai < ?
       AND jam_selesai > ?`,
      [ruangan.trim(), hari, jam_selesai, jam_mulai]
    );

    if (roomConflict.length > 0) {
      return responseHelper.error(
        res,
        'Bentrok jadwal: Ruangan sudah digunakan di hari dan jam tersebut.',
        409,
        ['Ruangan sudah digunakan di hari dan jam yang sama.']
      );
    }

    const [result] = await pool.query(
      `INSERT INTO schedules
       (subject_id, teacher_id, hari, jam_mulai, jam_selesai, ruangan)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [subject_id, teacher_id, hari, jam_mulai, jam_selesai, ruangan.trim()]
    );

    return responseHelper.success(
      res,
      {
        id: result.insertId,
        subject_id,
        teacher_id,
        hari,
        jam_mulai,
        jam_selesai,
        ruangan: ruangan.trim()
      },
      'Jadwal kelas berhasil dibuat.',
      201
    );
  } catch (err) {
    console.error('[JADWAL CONTROLLER] createJadwal:', err.message);
    return responseHelper.error(res, 'Gagal membuat jadwal kelas.', 500);
  }
};

exports.deleteJadwal = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM schedules WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return responseHelper.error(res, 'Jadwal tidak ditemukan.', 404);
    }

    return responseHelper.success(res, null, 'Jadwal berhasil dihapus.');
  } catch (err) {
    console.error('[JADWAL CONTROLLER] deleteJadwal:', err.message);
    return responseHelper.error(res, 'Gagal menghapus jadwal.', 500);
  }
};

exports.exportIcsJadwal = async (req, res) => {
  try {
    const { teacher_id, nip, nis, semester_start } = req.query;
    const param = teacher_id || nip || nis;
    const tanggalMulai = semester_start || '20260101';

    if (!param) {
      return responseHelper.error(res, 'Parameter teacher_id, nip, atau nis wajib diisi', 400);
    }

    let rows;
    if (nis) {
      [rows] = await pool.query(
        `SELECT s.id, s.hari, s.jam_mulai, s.jam_selesai, s.ruangan,
                sub.nama_pelajaran, t.nama AS nama_guru
         FROM schedule_students ss
         JOIN schedules s ON s.id = ss.schedule_id
         JOIN subjects sub ON sub.id = s.subject_id
         JOIN teachers t ON t.id = s.teacher_id
         JOIN students st ON st.id = ss.student_id
         WHERE st.nis = ?
         ORDER BY FIELD(s.hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'), s.jam_mulai ASC`,
        [nis]
      );
    } else if (nip || teacher_id) {
      const idParam = teacher_id || nip;
      const isNip = !teacher_id;
      let query;
      if (isNip) {
        query = `SELECT s.id, s.hari, s.jam_mulai, s.jam_selesai, s.ruangan,
                        sub.nama_pelajaran, t.nama AS nama_guru
                 FROM schedules s
                 JOIN subjects sub ON sub.id = s.subject_id
                 JOIN teachers t ON t.id = s.teacher_id
                 WHERE t.nip = ?
                 ORDER BY FIELD(s.hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'), s.jam_mulai ASC`;
      } else {
        query = `SELECT s.id, s.hari, s.jam_mulai, s.jam_selesai, s.ruangan,
                        sub.nama_pelajaran, t.nama AS nama_guru
                 FROM schedules s
                 JOIN subjects sub ON sub.id = s.subject_id
                 JOIN teachers t ON t.id = s.teacher_id
                 WHERE s.teacher_id = ?
                 ORDER BY FIELD(s.hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'), s.jam_mulai ASC`;
      }
      [rows] = await pool.query(query, [idParam]);
    }

    if (!rows || rows.length === 0) {
      return responseHelper.error(res, 'Tidak ada jadwal untuk diekspor.', 404);
    }

    const hariMap = {
      Senin: 'MO',
      Selasa: 'TU',
      Rabu: 'WE',
      Kamis: 'TH',
      Jumat: 'FR',
      Sabtu: 'SA'
    };

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MiSiS//SIS SMK//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    for (const r of rows) {
      const startDate = tanggalMulai.replace(/-/g, '');
      const jamMulaiStr =
        typeof r.jam_mulai === 'string'
          ? r.jam_mulai.substring(0, 2) + r.jam_mulai.substring(3, 5) + '00'
          : r.jam_mulai.toTimeString().substring(0, 8).replace(/:/g, '');
      const jamSelesaiStr =
        typeof r.jam_selesai === 'string'
          ? r.jam_selesai.substring(0, 2) + r.jam_selesai.substring(3, 5) + '00'
          : r.jam_selesai.toTimeString().substring(0, 8).replace(/:/g, '');

      const dtStart = startDate + 'T' + jamMulaiStr;
      const dtEnd = startDate + 'T' + jamSelesaiStr;
      const dayCode = hariMap[r.hari] || 'MO';

      icsLines.push(
        'BEGIN:VEVENT',
        'UID:' + r.id + '-' + Date.now() + '@misis',
        'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').substring(0, 15) + 'Z',
        'DTSTART:' + dtStart,
        'DTEND:' + dtEnd,
        'RRULE:FREQ=WEEKLY;BYDAY=' + dayCode,
        'SUMMARY:' + r.nama_pelajaran + (r.ruangan ? ' - ' + r.ruangan : ''),
        'LOCATION:' + (r.ruangan || ''),
        'DESCRIPTION:Guru: ' + (r.nama_guru || ''),
        'END:VEVENT'
      );
    }

    icsLines.push('END:VCALENDAR');
    const icsContent = icsLines.join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="jadwal.ics"');
    return res.send(icsContent);
  } catch (err) {
    console.error('[JADWAL] exportIcsJadwal:', err.message);
    return responseHelper.error(res, 'Gagal mengekspor jadwal.', 500);
  }
};

exports.updateJadwal = async (req, res) => {
  const { id } = req.params;
  const { subject_id, teacher_id, hari, jam_mulai, jam_selesai, ruangan } = req.body;

  const errors = [];
  if (!subject_id) errors.push('Mata pelajaran harus dipilih.');
  if (!teacher_id) errors.push('Guru pengampu harus dipilih.');
  if (!hari) errors.push('Hari harus dipilih.');
  if (!jam_mulai) errors.push('Jam mulai harus diisi.');
  if (!jam_selesai) errors.push('Jam selesai harus diisi.');
  if (!ruangan || !ruangan.trim()) errors.push('Ruangan tidak boleh kosong.');

  if (jam_mulai && jam_selesai && jam_mulai >= jam_selesai) {
    errors.push('Jam selesai harus lebih besar dari jam mulai.');
  }

  if (errors.length > 0) {
    return responseHelper.error(res, 'Validasi gagal.', 400, errors);
  }

  try {
    const [existing] = await pool.query('SELECT id FROM schedules WHERE id = ?', [id]);
    if (existing.length === 0) {
      return responseHelper.error(res, 'Jadwal tidak ditemukan.', 404);
    }

    const [existingTeacher] = await pool.query(
      "SELECT id FROM teachers WHERE id = ? AND status = 'aktif'",
      [teacher_id]
    );
    if (existingTeacher.length === 0) {
      return responseHelper.error(res, 'Guru tidak ditemukan atau tidak aktif.', 400, [
        'Guru tidak ditemukan atau tidak aktif.'
      ]);
    }

    const [existingSubject] = await pool.query('SELECT id FROM subjects WHERE id = ?', [
      subject_id
    ]);
    if (existingSubject.length === 0) {
      return responseHelper.error(res, 'Mata pelajaran tidak ditemukan.', 400, [
        'Mata pelajaran tidak ditemukan.'
      ]);
    }

    const validDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    if (!validDays.includes(hari)) {
      return responseHelper.error(res, 'Hari tidak valid.', 400, ['Hari tidak valid.']);
    }

    // Cek bentrok guru (kecuali jadwal yang sedang diedit)
    const [guruConflict] = await pool.query(
      `SELECT id FROM schedules
       WHERE teacher_id = ? AND hari = ? AND jam_mulai < ? AND jam_selesai > ? AND id != ?`,
      [teacher_id, hari, jam_selesai, jam_mulai, id]
    );

    if (guruConflict.length > 0) {
      return responseHelper.error(
        res,
        'Bentrok jadwal: Guru sudah memiliki jadwal di hari dan jam tersebut.',
        409,
        ['Guru sudah memiliki jadwal di hari dan jam yang sama.']
      );
    }

    // Cek bentrok ruangan (kecuali jadwal yang sedang diedit)
    const [roomConflict] = await pool.query(
      `SELECT id FROM schedules
       WHERE ruangan = ? AND hari = ? AND jam_mulai < ? AND jam_selesai > ? AND id != ?`,
      [ruangan.trim(), hari, jam_selesai, jam_mulai, id]
    );

    if (roomConflict.length > 0) {
      return responseHelper.error(
        res,
        'Bentrok jadwal: Ruangan sudah digunakan di hari dan jam tersebut.',
        409,
        ['Ruangan sudah digunakan di hari dan jam yang sama.']
      );
    }

    await pool.query(
      `UPDATE schedules SET subject_id=?, teacher_id=?, hari=?, jam_mulai=?, jam_selesai=?, ruangan=?
       WHERE id=?`,
      [subject_id, teacher_id, hari, jam_mulai, jam_selesai, ruangan.trim(), id]
    );

    return responseHelper.success(res, null, 'Jadwal kelas berhasil diubah.');
  } catch (err) {
    console.error('[JADWAL CONTROLLER] updateJadwal:', err.message);
    return responseHelper.error(res, 'Gagal mengubah jadwal kelas.', 500);
  }
};

exports.getJadwalSiswa = async (req, res) => {
  const { nis } = req.query;

  if (!nis || !nis.trim()) {
    return responseHelper.error(res, 'Parameter NIS tidak boleh kosong.', 400);
  }

  try {
    // Pastikan siswa dengan NIS tersebut ada
    const [siswa] = await pool.query('SELECT id, nama FROM students WHERE nis = ?', [nis.trim()]);
    if (siswa.length === 0) {
      return responseHelper.error(res, 'Siswa dengan NIS tersebut tidak ditemukan.', 404);
    }

    const [rows] = await pool.query(
      `SELECT
         sc.id,
         sc.hari,
         sc.jam_mulai,
         sc.jam_selesai,
         sc.ruangan,
         sub.nama_pelajaran,
         t.nama AS nama_guru
       FROM schedule_students ss
       JOIN schedules  sc  ON sc.id  = ss.schedule_id
       JOIN subjects   sub ON sub.id = sc.subject_id
       JOIN teachers   t   ON t.id   = sc.teacher_id
       JOIN students   st  ON st.id  = ss.student_id
       WHERE st.nis = ?
       ORDER BY
         FIELD(sc.hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'),
         sc.jam_mulai ASC`,
      [nis.trim()]
    );

    return responseHelper.success(
      res,
      rows,
      `Jadwal untuk siswa ${siswa[0].nama} berhasil diambil`
    );
  } catch (err) {
    console.error('[JADWAL CONTROLLER] getJadwalSiswa:', err.message);
    return responseHelper.error(res, 'Gagal mengambil jadwal siswa.', 500);
  }
};

exports.getJadwalGuru = async (req, res) => {
  const { nip } = req.query;

  if (!nip || !nip.trim()) {
    return responseHelper.error(res, 'Parameter NIP tidak boleh kosong.', 400);
  }

  try {
    const [guru] = await pool.query('SELECT id, nama FROM teachers WHERE nip = ?', [nip.trim()]);
    if (guru.length === 0) {
      return responseHelper.error(res, 'Guru dengan NIP tersebut tidak ditemukan.', 404);
    }

    const [rows] = await pool.query(
      `SELECT
         s.id,
         s.hari,
         s.jam_mulai,
         s.jam_selesai,
         s.ruangan,
         sub.nama_pelajaran
       FROM schedules s
       JOIN subjects sub ON sub.id = s.subject_id
       JOIN teachers t   ON t.id   = s.teacher_id
       WHERE t.nip = ?
       ORDER BY
         FIELD(s.hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'),
         s.jam_mulai ASC`,
      [nip.trim()]
    );

    return responseHelper.success(
      res,
      rows,
      `Jadwal mengajar untuk ${guru[0].nama} berhasil diambil`
    );
  } catch (err) {
    console.error('[JADWAL CONTROLLER] getJadwalGuru:', err.message);
    return responseHelper.error(res, 'Gagal mengambil jadwal guru.', 500);
  }
};
