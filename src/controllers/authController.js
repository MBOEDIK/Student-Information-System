// src/controllers/authController.js

const crypto = require('crypto');
const pool   = require('../config/db');

// ── Helper: SHA-256 ─────────────────────────────────────────
function hashPassword(plainText) {
  return crypto.createHash('sha256').update(plainText).digest('hex');
}

// ── GET /api/dashboard/user  ──
exports.checkSession = (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ 
      success: true, 
      loggedIn: true, 
      user: req.session.user 
    });
  }
  res.status(401).json({ success: false, loggedIn: false, message: 'Belum login.' });
};

// ── POST /api/auth/login ─────────────────────────────────────
exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Validasi input
  if (!username || !username.trim()) {
    return res.status(400).json({ success: false, message: 'Username tidak boleh kosong.' });
  }
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password tidak boleh kosong.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, password, role, nama_lengkap FROM users WHERE username = ?',
      [username.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username tidak ditemukan.' });
    }

    const user = rows[0];

    // Verifikasi password
    const hashedInput = hashPassword(password);
    if (hashedInput !== user.password) {
      return res.status(401).json({ success: false, message: 'Password salah.' });
    }

    // Simpan data ke session
    const sessionData = {
      id:       user.id,
      username: user.username,
      nama:     user.nama_lengkap,
      role:     user.role,
      loginAt:  new Date().toISOString()
    };

    // Regenerate session ID (cegah session fixation)
    req.session.regenerate((err) => {
      if (err) {
        console.error('[SESSION REGENERATE ERROR]', err);
        return res.status(500).json({ success: false, message: 'Kesalahan server.' });
      }

      req.session.user = sessionData;
      console.log(`[LOGIN] "${user.username}" (${user.role}) berhasil login.`);

      // 🔥 KUNCI UTAMA: Paksa simpan ke memori sebelum melempar respons JSON
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('[SESSION SAVE ERROR]', saveErr);
          return res.status(500).json({ success: false, message: 'Gagal mengamankan sesi.' });
        }

        return res.json({
          success:  true,
          message:  'Login berhasil.',
          user: {
            id:       user.id,
            username: user.username,
            nama:     user.nama_lengkap,
            role:     user.role
          }
        });
      });
    });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ success: false, message: 'Kesalahan pada server.' });
  }
};

// ── POST /api/auth/logout ────────────────────────────────────
exports.logout = (req, res) => {
  const username = req.session.user?.username || 'unknown';

  req.session.destroy((err) => {
    if (err) console.error('[LOGOUT ERROR]', err);
    console.log(`[LOGOUT] "${username}" logout.`);
    res.clearCookie('connect.sid', { path: '/' });
    res.json({ success: true, message: 'Logout berhasil.' });
  });
};