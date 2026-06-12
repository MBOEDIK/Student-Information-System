const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_information_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
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
