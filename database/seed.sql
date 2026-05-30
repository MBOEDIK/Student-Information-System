-- ============================================================
-- DATA SEED: Hanya Mengisi Tabel Users
-- Database: schema
-- ============================================================

USE `schema`;

TRUNCATE TABLE users;

-- Password : admin123, guru123, siswa123
INSERT INTO users (username, password, role, nama_lengkap) VALUES
('admin',    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'Administrator'),
('19800101', 'ae81343369944399b70de862dbe75536faa8e44c50ad0a312e380303173f4756', 'guru',  'Bapak Hendra S.Pd'),
('20240001', 'ca82d8a67832679fdc39c9156f087e31236b833ee7371eb3d6e081aeb90016c9', 'siswa', 'Santoso');