-- ============================================================
-- SCHEMA: schema
-- Database: MySQL (XAMPP)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `schema`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `schema`;

-- ============================================================
-- TABEL: users (untuk login)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password      VARCHAR(64)  NOT NULL,
  role          ENUM('admin','guru','siswa') NOT NULL,
  nama_lengkap  VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_users_username   ON users(username);
CREATE INDEX idx_users_role       ON users(role);

-- ============================================================
-- TABEL: students (data pendaftaran siswa baru)
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nis           VARCHAR(20)  NOT NULL UNIQUE,
  nama          VARCHAR(100) NOT NULL,
  jenis_kelamin ENUM('Laki-laki','Perempuan') NOT NULL,
  alamat        TEXT,
  status        ENUM('aktif','tidak aktif','lulus') DEFAULT 'aktif',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_students_nis     ON students(nis);
CREATE INDEX idx_students_status  ON students(status);
