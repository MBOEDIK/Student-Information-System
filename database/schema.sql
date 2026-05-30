-- ============================================================
-- SCHEMA: schema
-- Database: MySQL (XAMPP)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `schema`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `schema`;

-- ============================================================
-- TABEL: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,   -- NIS / NIP / Custom Admin
  password      VARCHAR(64)  NOT NULL,           -- SHA-256 hex
  role          ENUM('admin','guru','siswa') NOT NULL,
  nama_lengkap  VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- INDEX untuk performa pencarian username saat login
-- ============================================================
CREATE INDEX idx_users_username   ON users(username);
CREATE INDEX idx_users_role       ON users(role);