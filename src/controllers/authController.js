const crypto = require('crypto');
const pool = require('../config/db');
const responseHelper = require('../shared/response');

function hashPassword(plainText) {
  return crypto.createHash('sha256').update(plainText).digest('hex');
}

exports.checkSession = (req, res) => {
  if (req.session && req.session.user) {
    return responseHelper.success(res, req.session.user, 'Sesi aktif', 200);
  }
  return responseHelper.error(res, 'Belum login.', 401);
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !username.trim()) {
    return responseHelper.error(res, 'Username tidak boleh kosong.', 400);
  }
  if (!password) {
    return responseHelper.error(res, 'Password tidak boleh kosong.', 400);
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, password, role, nama_lengkap FROM users WHERE username = ?',
      [username.trim()]
    );

    if (rows.length === 0) {
      return responseHelper.error(res, 'Username tidak ditemukan.', 401);
    }

    const user = rows[0];

    const hashedInput = hashPassword(password);
    if (hashedInput !== user.password) {
      return responseHelper.error(res, 'Password salah.', 401);
    }

    const sessionData = {
      id: user.id,
      username: user.username,
      nama: user.nama_lengkap,
      role: user.role,
      loginAt: new Date().toISOString()
    };

    if (user.role === 'guru') {
      const [teacherRows] = await pool.query('SELECT id FROM teachers WHERE nip = ?', [
        user.username
      ]);
      if (teacherRows.length > 0) {
        sessionData.teacher_id = teacherRows[0].id;
      }
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error('[AUTH] login regenerate:', err.message);
        return responseHelper.error(res, 'Kesalahan server.', 500);
      }

      req.session.user = sessionData;
      console.log(`[LOGIN] "${user.username}" (${user.role}) berhasil login.`);

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('[AUTH] login save:', saveErr.message);
          return responseHelper.error(res, 'Gagal mengamankan sesi.', 500);
        }

        return responseHelper.success(
          res,
          {
            id: user.id,
            username: user.username,
            nama: user.nama_lengkap,
            role: user.role
          },
          'Login berhasil.'
        );
      });
    });
  } catch (err) {
    console.error('[AUTH] login:', err.message);
    return responseHelper.error(res, 'Kesalahan pada server.', 500);
  }
};

exports.logout = (req, res) => {
  const username = req.session.user?.username || 'unknown';

  req.session.destroy((err) => {
    if (err) console.error('[AUTH] logout:', err.message);
    console.log(`[LOGOUT] "${username}" logout.`);

    res.clearCookie('connect.sid', { path: '/' });
    return responseHelper.success(res, null, 'Logout berhasil.');
  });
};
