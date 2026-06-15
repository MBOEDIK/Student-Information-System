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

-- ── Subjects (Mata Pelajaran) ───────────────────────────────
TRUNCATE TABLE subjects;

INSERT INTO subjects (id, nama_pelajaran) VALUES
(1, 'Matematika'),
(2, 'Bahasa Indonesia'),
(3, 'Bahasa Inggris'),
(4, 'Pendidikan Agama'),
(5, 'Pendidikan Pancasila'),
(6, 'Olahraga'),
(7, 'Produk Kreatif & Kewirausahaan'),
(8, 'Pemrograman Web'),
(9, 'Basis Data'),
(10, 'Komputer & Masyarakat');

-- ── Schedules (Jadwal Kelas - contoh) ───────────────────────
TRUNCATE TABLE schedules;

INSERT INTO schedules (subject_id, teacher_id, hari, jam_mulai, jam_selesai, ruangan) VALUES
(1,  1, 'Senin', '07:00:00', '08:30:00', 'R-101'),
(8,  3, 'Senin', '09:00:00', '11:00:00', 'Lab Komputer 1'),
(2,  2, 'Selasa','07:00:00', '08:30:00', 'R-102'),
(9,  5, 'Selasa','09:00:00', '11:00:00', 'Lab Komputer 2'),
(3,  4, 'Rabu',  '07:00:00', '08:30:00', 'R-101');

-- ── Schedule Students (Relasi Siswa & Jadwal) ───────────────
TRUNCATE TABLE schedule_students;

INSERT INTO schedule_students (schedule_id, student_id) VALUES
-- Jadwal 1: Senin 07:00 R-101
(1, 1), (1, 2), (1, 3), (1, 4), (1, 6),

-- Jadwal 2: Senin 09:00 Lab Komputer 1
(2, 3), (2, 5), (2, 7), (2, 8), (2, 9),

-- Jadwal 3: Selasa 07:00 R-102
(3, 1), (3, 2), (3, 4), (3, 6), (3, 10),

-- Jadwal 4: Selasa 09:00 Lab Komputer 2
(4, 5), (4, 7), (4, 8), (4, 9), (4, 10),

-- Jadwal 5: Rabu 07:00 R-101
(5, 1), (5, 3), (5, 4), (5, 6), (5, 9);

-- ── Health Records (Riwayat Kesehatan Siswa) ────────────────
TRUNCATE TABLE health_records;

INSERT INTO health_records (student_id, golongan_darah, penyakit_bawaan, riwayat_vaksin, alergi) VALUES
(1, 'O', NULL,                                   'Lengkap',                      NULL),
(2, 'A', 'Asma',                                 'Lengkap',                      'Debu, Bulu kucing'),
(3, 'B', NULL,                                   'Lengkap',                      NULL),
(4, 'AB','Hipertensi ringan',                    'Lengkap',                      'Makanan laut'),
(6, 'O', NULL,                                   'Lengkap',                      'Penisilin'),
(8, 'A', 'Diabetes tipe 1',                      'Belum lengkap',                NULL),
(9, 'B', NULL,                                   'Lengkap',                      NULL),
(10,'O', NULL,                                   'Lengkap',                      'Kacang-kacangan');

-- ── Absensi (Kehadiran Siswa) ────────────────────────────────
TRUNCATE TABLE absensi;

INSERT INTO absensi (siswa_id, schedule_id, status, keterangan, tanggal) VALUES
(1, 1, 'Hadir', NULL,            '2026-06-12'),
(2, 1, 'Hadir', NULL,            '2026-06-12'),
(3, 1, 'Sakit', 'Demam',         '2026-06-12'),
(4, 1, 'Izin',  'Acara keluarga','2026-06-12'),
(6, 1, 'Hadir', NULL,            '2026-06-12'),
(8, 2, 'Alpa',  NULL,            '2026-06-12'),
(9, 2, 'Hadir', NULL,            '2026-06-12'),
(10,2, 'Hadir', NULL,            '2026-06-12');

-- ── Grades (Nilai / Transkrip Siswa) ─────────────────────────
TRUNCATE TABLE grades;

INSERT INTO grades (student_id, subject_id, semester, tugas, uts, uas) VALUES
(1, 1, 'Ganjil 2025/2026', 85, 90, 88),
(1, 2, 'Ganjil 2025/2026', 78, 82, 80),
(1, 3, 'Ganjil 2025/2026', 92, 88, 95),
(2, 1, 'Ganjil 2025/2026', 75, 80, 78),
(2, 2, 'Ganjil 2025/2026', 88, 85, 90),
(2, 3, 'Ganjil 2025/2026', 70, 75, 72);