const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: 'sis-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const siswaRoutes = require('./routes/siswaRoutes');
const guruRoutes = require('./routes/guruRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/guru', guruRoutes);

app.get('/api/auth/check', (req, res) => {
  if (req.session.user) res.json({ user: req.session.user });
  else res.status(401).json({ error: 'Belum login' });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});