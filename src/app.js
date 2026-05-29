require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path    = require('path');

const authRoutes  = require('./routes/authRoutes');
const siswaRoutes = require('./routes/siswaRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret:            process.env.SESSION_SECRET || 'sis_secret_ganti_ini',
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   1000 * 60 * 60 * 8
  }
}));

app.use('/api/auth',  authRoutes);
app.use('/api/siswa', siswaRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
  }
  res.status(404).sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((err, req, res, next) => {
  console.error('[APP ERROR]', err);
  res.status(500).json({ success: false, message: 'Kesalahan server.' });
});

app.listen(PORT, () => {
  console.log('');
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Login : http://localhost:${PORT}/index.html`);
  console.log(`Mode  : ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});

module.exports = app;
