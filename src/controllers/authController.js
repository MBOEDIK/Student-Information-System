const db = require('../config/db');
const bcrypt = require('bcrypt');

const login = (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Username tidak ditemukan' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Password salah' });

    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ message: 'Login berhasil', redirect: '/dashboard.html' });
  });
};

const logout = (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout berhasil' });
};

module.exports = { login, logout };