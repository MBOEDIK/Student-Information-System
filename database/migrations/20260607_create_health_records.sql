CREATE TABLE IF NOT EXISTS health_records (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL UNIQUE,
  golongan_darah  ENUM('A','B','AB','O','Tidak Diketahui') DEFAULT 'Tidak Diketahui',
  penyakit_bawaan TEXT,
  riwayat_vaksin  TEXT,
  alergi          TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
