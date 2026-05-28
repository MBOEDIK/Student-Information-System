const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'student_information_system'
});

db.connect((err) => {
  if (err) {
    console.error('Gagal koneksi ke database:', err.message);
    return;
  }
  console.log('Berhasil konek ke database MySQL!');
});

module.exports = db;