require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');

const pool = require('./config/db');
const responseHelper = require('./shared/response');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use('/api', routes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return responseHelper.error(res, 'Endpoint tidak ditemukan.', 404);
  }
  res.status(404).sendFile(path.join(__dirname, '../public/index.html'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[APP] globalErrorHandler:', err.message);
  return responseHelper.error(res, 'Kesalahan server.', 500);
});

app.listen(PORT, () => {
  console.log('');
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Login : http://localhost:${PORT}/index.html`);
  console.log(`Mode  : ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});

module.exports = app;
