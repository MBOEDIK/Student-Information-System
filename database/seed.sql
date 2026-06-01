-- ============================================================
-- DATA SEED
-- Database: schema
-- ============================================================

USE `schema`;

-- ── Users (untuk autentikasi login) ────────────────────────
TRUNCATE TABLE users;

-- Password : admin123, guru123, siswa123
INSERT INTO users (username, password, role, nama_lengkap) VALUES
('admin',    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'Administrator'),
('19800101', 'ae81343369944399b70de862dbe75536faa8e44c50ad0a312e380303173f4756', 'guru',  'Bapak Hendra S.Pd'),
('20240001', 'ca82d8a67832679fdc39c9156f087e31236b833ee7371eb3d6e081aeb90016c9', 'siswa', 'Santoso');

-- ── Teachers ───────────────────────────────────────────────
TRUNCATE TABLE teachers;

INSERT INTO teachers (nip, nama, email, status) VALUES
('19800101', 'Bapak Hendra S.Pd',        'hendra@sekolah.id',     'aktif'),
('19850712', 'Ibu Dewi Sartika S.Pd',    'dewi@sekolah.id',       'aktif'),
('19900320', 'Bapak Agus Wijaya M.Kom',  'agus@sekolah.id',       'aktif'),
('19911205', 'Ibu Nining Wahyuni S.Pd',  'nining@sekolah.id',     'aktif'),
('19880817', 'Bapak Eko Prasetyo S.Kom', 'eko@sekolah.id',        'tidak aktif'),
('19950730', 'Ibu Rina Marlina S.Si',    'rinamarlina@sekolah.id','aktif');

-- ── Students ───────────────────────────────────────────────
TRUNCATE TABLE students;

INSERT INTO students (nis, nama, jenis_kelamin, alamat, status) VALUES
('20240001', 'Santoso',         'Laki-laki', 'Jl. Ijen No. 10, Malang',            'aktif'),
('20240002', 'Siti Rahmawati',  'Perempuan', 'Jl. Merdeka No. 10, Malang',         'aktif'),
('20240003', 'Budi Santoso',    'Laki-laki', 'Jl. A Yani No. 22, Surabaya',        'aktif'),
('20240004', 'Ani Kusuma Wati', 'Perempuan', 'Jl. Diponegoro No. 5, Malang',       'aktif'),
('20240005', 'Dwi Prasetyo',    'Laki-laki', 'Jl. Panglima Sudirman No. 8, Malang','tidak aktif'),
('20240006', 'Rina Marlina',    'Perempuan', 'Jl. Gajayana No. 15, Malang',        'aktif'),
('20240007', 'Ahmad Rizki',     'Laki-laki', 'Jl. Veteran No. 33, Malang',         'lulus'),
('20240008', 'Dewi Lestari',    'Perempuan', 'Jl. Ijen No. 77, Malang',            'aktif'),
('20240009', 'Bayu Aji Saputra','Laki-laki', 'Jl. Bromo No. 12, Batu',             'aktif'),
('SMK24010', 'Fitriana Dewi',   'Perempuan', 'Jl. Semeru No. 45, Malang',          'aktif');