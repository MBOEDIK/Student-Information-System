const crypto = require('crypto');
const pool   = require('../config/db');

function hashPassword(plainText) {
  return crypto.createHash('sha256').update(plainText).digest('hex');
}

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

exports.login = async (req, res) => {
  const { username, password } = req.body;

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
    const hashedInput = hashPassword(password);

    if (hashedInput !== user.password) {
      return res.status(401).json({ success: false, message: 'Password salah.' });
    }

    const sessionData = {
      id:       user.id,
      username: user.username,
      nama:     user.nama_lengkap,
      role:     user.role,
      loginAt:  new Date().toISOString()
    };

    req.session.regenerate((err) => {
      if (err) {
        console.error('[SESSION REGENERATE ERROR]', err);
        return res.status(500).json({ success: false, message: 'Kesalahan server.' });
      }

      req.session.user = sessionData;

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('[SESSION SAVE ERROR]', saveErr);
          return res.status(500).json({ success: false, message: 'Gagal mengamankan sesi.' });
        }

        return res.json({
          success: true,
          message: 'Login berhasil.',
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

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('[LOGOUT ERROR]', err);
      return res.status(500).json({ success: false, message: 'Gagal logout.' });
    }
    res.json({ success: true, message: 'Logout berhasil.' });
  });
};
