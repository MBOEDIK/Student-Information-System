const mysql = require('mysql2/promise');

const rawHost = process.env.DB_HOST || 'localhost';
const colonIdx = rawHost.lastIndexOf(':');
const hasPort = colonIdx > rawHost.lastIndexOf(']') && colonIdx > 0;
const host = hasPort ? rawHost.slice(0, colonIdx) : rawHost;
const port = hasPort
  ? parseInt(rawHost.slice(colonIdx + 1), 10)
  : parseInt(process.env.DB_PORT || '3306', 10);

const pool = mysql.createPool({
  host: host,
  port: port,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_information_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  ssl: process.env.DB_SSL === 'true' ? {} : undefined
});

// Test koneksi saat startup server
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Berhasil terhubung ke MySQL (XAMPP)');
    conn.release();
  } catch (err) {
    console.error('❌ Gagal koneksi ke MySQL:', err.message);
  }
})();

module.exports = pool;
