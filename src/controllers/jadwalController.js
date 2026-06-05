// src/controllers/jadwalController.js
// Menangani logika pembuatan dan pengelolaan jadwal kelas

const pool = require('../config/db');
const responseHelper = require('../shared/response');

exports.getAllSubjects = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nama_pelajaran FROM subjects ORDER BY nama_pelajaran ASC'
    );

    return responseHelper.success(
      res,
      rows,
      'Daftar mata pelajaran berhasil diambil'
    );
  } catch (err) {
    console.error('[JADWAL CONTROLLER] getAllSubjects:', err.message);
    return responseHelper.error(
      res,
      'Gagal mengambil data mata pelajaran',
      500
    );
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

    return responseHelper.success(
      res,
      rows,
      'Daftar jadwal berhasil diambil'
    );
  } catch (err) {
    console.error('[JADWAL CONTROLLER] getAllJadwal:', err.message);
    return responseHelper.error(
      res,
      'Gagal mengambil data jadwal',
      500
    );
  }
};

exports.createJadwal = async (req, res) => {
  const {
    subject_id,
    teacher_id,
    hari,
    jam_mulai,
    jam_selesai,
    ruangan
  } = req.body;

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
    return responseHelper.error(
      res,
      'Validasi gagal.',
      400,
      errors
    );
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
      return responseHelper.error(
        res,
        'Guru tidak ditemukan atau tidak aktif.',
        400,
        ['Guru tidak ditemukan atau tidak aktif.']
      );
    }

    const [existingSubject] = await pool.query(
      'SELECT id FROM subjects WHERE id = ?',
      [subject_id]
    );

    if (existingSubject.length === 0) {
      return responseHelper.error(
        res,
        'Mata pelajaran tidak ditemukan.',
        400,
        ['Mata pelajaran tidak ditemukan.']
      );
    }

    const validDays = [
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu'
    ];

    if (!validDays.includes(hari)) {
      return responseHelper.error(
        res,
        'Hari tidak valid.',
        400,
        ['Hari tidak valid.']
      );
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
      [
        subject_id,
        teacher_id,
        hari,
        jam_mulai,
        jam_selesai,
        ruangan.trim()
      ]
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
    return responseHelper.error(
      res,
      'Gagal membuat jadwal kelas.',
      500
    );
  }
};

exports.deleteJadwal = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM schedules WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return responseHelper.error(
        res,
        'Jadwal tidak ditemukan.',
        404
      );
    }

    return responseHelper.success(
      res,
      null,
      'Jadwal berhasil dihapus.'
    );
  } catch (err) {
    console.error('[JADWAL CONTROLLER] deleteJadwal:', err.message);
    return responseHelper.error(
      res,
      'Gagal menghapus jadwal.',
      500
    );
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
      `SELECT id FROM teachers WHERE id = ? AND status = 'aktif'`,
      [teacher_id]
    );
    if (existingTeacher.length === 0) {
      return responseHelper.error(res, 'Guru tidak ditemukan atau tidak aktif.', 400, [
        'Guru tidak ditemukan atau tidak aktif.'
      ]);
    }

    const [existingSubject] = await pool.query(
      'SELECT id FROM subjects WHERE id = ?',
      [subject_id]
    );
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
