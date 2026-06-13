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

-- ============================================================
-- TABEL: teachers (data guru)
-- ============================================================
CREATE TABLE IF NOT EXISTS teachers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nip           VARCHAR(20)  NOT NULL UNIQUE,
  nama          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) DEFAULT NULL,
  status        ENUM('aktif','tidak aktif','pensiun') DEFAULT 'aktif',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_teachers_nip     ON teachers(nip);
CREATE INDEX idx_teachers_status  ON teachers(status);

-- ============================================================
-- TABEL: subjects (mata pelajaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nama_pelajaran VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABEL: schedules (jadwal kelas)
-- ============================================================
CREATE TABLE IF NOT EXISTS schedules (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  subject_id    INT NOT NULL,
  teacher_id    INT NOT NULL,
  hari          ENUM('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
  jam_mulai     TIME NOT NULL,
  jam_selesai   TIME NOT NULL,
  ruangan       VARCHAR(50) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_schedules_hari       ON schedules(hari);
CREATE INDEX idx_schedules_teacher    ON schedules(teacher_id);
CREATE INDEX idx_schedules_ruangan    ON schedules(ruangan);

-- ============================================================
-- TABEL: schedule_students (relasi banyak-ke-banyak siswa & jadwal)
-- ============================================================
CREATE TABLE IF NOT EXISTS schedule_students (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  student_id  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABEL: absensi (pencatatan absensi harian siswa)
-- ============================================================
CREATE TABLE IF NOT EXISTS absensi (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  siswa_id    INT NOT NULL,
  schedule_id INT DEFAULT NULL,
  status      ENUM('Hadir', 'Izin', 'Sakit', 'Alpa') NOT NULL,
  keterangan  TEXT,
  tanggal     DATE NOT NULL DEFAULT (CURRENT_DATE),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siswa_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- INDEX UNIQUE untuk mencegah duplikasi pendaftaran siswa di jadwal yang sama
-- ============================================================
CREATE UNIQUE INDEX uq_schedule_student ON schedule_students(schedule_id, student_id);

-- ============================================================
-- MIGRASI: absensi — tambah UNIQUE KEY & jadikan schedule_id wajib
-- ============================================================
ALTER TABLE absensi
  MODIFY COLUMN schedule_id INT NOT NULL,
  DROP FOREIGN KEY absensi_ibfk_2,
  ADD FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  ADD UNIQUE KEY uq_absensi_siswa_jadwal_tanggal (schedule_id, siswa_id, tanggal);

-- ============================================================
-- TABEL: health_records (riwayat kesehatan siswa)
-- ============================================================
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