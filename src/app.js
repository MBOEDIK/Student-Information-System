// src/app.js
// Entry point utama aplikasi Student Information System

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');

const pool = require('./config/db');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// ── Static files (HTML, CSS, JS frontend) ───────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ── Body parser ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Session Configuration (MySQLStore for Serverless) ─────────
const sessionStore = new MySQLStore(
  {
    expiration: 1000 * 60 * 60 * 8,
    createDatabaseTable: true,
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data'
      }
    }
  },
  pool
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sis_secret_ganti_ini',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

// ── API Routes Registration ───────────────────────────────────
app.use('/api', routes);

// ── Root Navigation → Landing Login Page ──────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── 404 Router Handlers ───────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
  }
  res.status(404).sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[APP ERROR]', err);
  res.status(500).json({ success: false, message: 'Kesalahan server.' });
});

// ── Start Network Boot Server ─────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📋 Login : http://localhost:${PORT}/index.html`);
  console.log(`🌍 Mode  : ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});

module.exports = app;
