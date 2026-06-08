-- Active: 1780916871183@@mysql-223a2ac2-student-information-system-mboedik.g.aivencloud.com@19203@defaultdb
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 08, 2026 at 01:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SESSION sql_require_primary_key = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_information_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `health_records`
--

CREATE TABLE `health_records` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `golongan_darah` enum('A','B','AB','O','Tidak Diketahui') DEFAULT 'Tidak Diketahui',
  `penyakit_bawaan` text DEFAULT NULL,
  `riwayat_vaksin` text DEFAULT NULL,
  `alergi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `health_records`
--

INSERT INTO `health_records` (`id`, `student_id`, `golongan_darah`, `penyakit_bawaan`, `riwayat_vaksin`, `alergi`, `created_at`, `updated_at`) VALUES
(1, 1, 'O', NULL, 'Lengkap', NULL, '2026-06-07 08:39:30', '2026-06-07 08:39:30'),
(2, 2, 'A', 'Asma', 'Lengkap', 'Debu, Bulu kucing', '2026-06-07 08:39:30', '2026-06-07 08:39:30'),
(3, 3, 'B', NULL, 'Lengkap', NULL, '2026-06-07 08:39:30', '2026-06-07 08:39:30'),
(4, 4, 'AB', 'Hipertensi ringan', 'Lengkap', 'Makanan laut', '2026-06-07 08:39:30', '2026-06-07 08:39:30'),
(5, 6, 'O', NULL, 'Lengkap', 'Penisilin', '2026-06-07 08:39:30', '2026-06-07 08:39:30'),
(6, 8, 'A', 'Diabetes tipe 1', 'Belum lengkap', NULL, '2026-06-07 08:39:30', '2026-06-07 08:39:30'),
(7, 9, 'B', NULL, 'Lengkap', NULL, '2026-06-07 08:39:30', '2026-06-07 08:39:30'),
(8, 10, 'O', NULL, 'Lengkap', 'Kacang-kacangan', '2026-06-07 08:39:30', '2026-06-07 08:39:30');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `hari` enum('Senin','Selasa','Rabu','Kamis','Jumat','Sabtu') NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `ruangan` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `subject_id`, `teacher_id`, `hari`, `jam_mulai`, `jam_selesai`, `ruangan`, `created_at`) VALUES
(33, 1, 1, 'Senin', '07:00:00', '08:30:00', 'R-101', '2026-06-05 17:31:35'),
(34, 8, 3, 'Senin', '09:00:00', '11:00:00', 'Lab Komputer 1', '2026-06-05 17:31:35'),
(35, 2, 2, 'Selasa', '07:00:00', '08:30:00', 'R-102', '2026-06-05 17:31:35'),
(36, 9, 5, 'Selasa', '09:00:00', '11:00:00', 'Lab Komputer 2', '2026-06-05 17:31:35'),
(37, 3, 4, 'Rabu', '07:00:00', '08:30:00', 'R-101', '2026-06-05 17:31:35');

-- --------------------------------------------------------

--
-- Table structure for table `schedule_students`
--

CREATE TABLE `schedule_students` (
  `id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedule_students`
--

INSERT INTO `schedule_students` (`id`, `schedule_id`, `student_id`, `created_at`) VALUES
(76, 33, 1, '2026-06-05 17:33:54'),
(77, 33, 2, '2026-06-05 17:33:54'),
(78, 33, 4, '2026-06-05 17:33:54'),
(79, 33, 4, '2026-06-05 17:33:54'),
(80, 33, 6, '2026-06-05 17:33:54'),
(81, 34, 3, '2026-06-05 17:33:54'),
(82, 34, 5, '2026-06-05 17:33:54'),
(83, 34, 7, '2026-06-05 17:33:54'),
(84, 34, 8, '2026-06-05 17:33:54'),
(85, 34, 9, '2026-06-05 17:33:54'),
(86, 35, 1, '2026-06-05 17:33:54'),
(87, 35, 2, '2026-06-05 17:33:54'),
(88, 35, 4, '2026-06-05 17:33:54'),
(89, 35, 6, '2026-06-05 17:33:54'),
(90, 35, 10, '2026-06-05 17:33:54'),
(91, 36, 5, '2026-06-05 17:33:54'),
(92, 36, 7, '2026-06-05 17:33:54'),
(93, 36, 8, '2026-06-05 17:33:54'),
(94, 36, 9, '2026-06-05 17:33:54'),
(95, 36, 10, '2026-06-05 17:33:54'),
(96, 37, 1, '2026-06-05 17:33:54'),
(97, 37, 3, '2026-06-05 17:33:54'),
(98, 37, 4, '2026-06-05 17:33:54'),
(99, 37, 6, '2026-06-05 17:33:54'),
(100, 37, 9, '2026-06-05 17:33:54');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `nis` varchar(20) NOT NULL,
  `kelas` varchar(20) DEFAULT NULL,
  `nama` varchar(100) NOT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') NOT NULL,
  `alamat` text DEFAULT NULL,
  `status` enum('aktif','tidak aktif','lulus') DEFAULT 'aktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `nis`, `kelas`, `nama`, `jenis_kelamin`, `alamat`, `status`, `created_at`) VALUES
(1, '22387327447141317389', '', 'Gibran', 'Laki-laki', 'adaiodakacopakcawopkc', 'aktif', '2026-05-31 11:45:01'),
(2, '293129391419', NULL, 'Jokowi', 'Laki-laki', 'awkdwoidkwawkdi', 'aktif', '2026-05-31 13:27:27'),
(3, '091209240910239', NULL, 'Prabngewe', 'Laki-laki', 'kdaidkaodwaodwoadla', 'aktif', '2026-06-01 05:38:35'),
(4, '20240001', NULL, 'Santoso', 'Laki-laki', 'Jl. Ijen No. 10, Malang', 'aktif', '2026-06-05 17:18:11'),
(5, '20240002', NULL, 'Siti Rahmawati', 'Perempuan', 'Jl. Merdeka No. 10, Malang', 'aktif', '2026-06-05 17:18:11'),
(6, '20240003', NULL, 'Budi Santoso', 'Laki-laki', 'Jl. A Yani No. 22, Surabaya', 'aktif', '2026-06-05 17:18:11'),
(7, '20240004', NULL, 'Ani Kusuma Wati', 'Perempuan', 'Jl. Diponegoro No. 5, Malang', 'aktif', '2026-06-05 17:18:11'),
(8, '20240005', NULL, 'Dwi Prasetyo', 'Laki-laki', 'Jl. Panglima Sudirman No. 8, Malang', 'tidak aktif', '2026-06-05 17:18:11'),
(9, '20240006', NULL, 'Rina Marlina', 'Perempuan', 'Jl. Gajayana No. 15, Malang', 'aktif', '2026-06-05 17:18:11'),
(10, '20240007', NULL, 'Ahmad Rizki', 'Laki-laki', 'Jl. Veteran No. 33, Malang', 'lulus', '2026-06-05 17:18:11'),
(11, '20240008', NULL, 'Dewi Lestari', 'Perempuan', 'Jl. Ijen No. 77, Malang', 'aktif', '2026-06-05 17:18:11'),
(12, '20240009', NULL, 'Bayu Aji Saputra', 'Laki-laki', 'Jl. Bromo No. 12, Batu', 'aktif', '2026-06-05 17:18:11'),
(13, 'SMK24010', NULL, 'Fitriana Dewi', 'Perempuan', 'Jl. Semeru No. 45, Malang', 'aktif', '2026-06-05 17:18:11');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `nama_pelajaran` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `nama_pelajaran`) VALUES
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

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `nip` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` enum('aktif','tidak aktif','pensiun') DEFAULT 'aktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `nip`, `nama`, `email`, `status`, `created_at`) VALUES
(1, '19800101', 'Bapak Hendra S.Pd', 'hendra@sekolah.id', 'aktif', '2026-06-05 16:19:59'),
(2, '19850712', 'Ibu Dewi Sartika S.Pd', 'dewi@sekolah.id', 'aktif', '2026-06-05 16:19:59'),
(3, '19900320', 'Bapak Agus Wijaya M.Kom', 'agus@sekolah.id', 'aktif', '2026-06-05 16:19:59'),
(4, '19911205', 'Ibu Nining Wahyuni S.Pd', 'nining@sekolah.id', 'aktif', '2026-06-05 16:19:59'),
(5, '19880817', 'Bapak Eko Prasetyo S.Kom', 'eko@sekolah.id', 'tidak aktif', '2026-06-05 16:19:59'),
(6, '19950730', 'Ibu Rina Marlina S.Si', 'rinamarlina@sekolah.id', 'aktif', '2026-06-05 16:19:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(64) NOT NULL,
  `role` enum('admin','guru','siswa') NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `nama_lengkap`, `created_at`) VALUES
(2, '19800101', 'ae81343369944399b70de862dbe75536faa8e44c50ad0a312e380303173f4756', 'guru', 'Bapak Hendra S.Pd', '2026-05-30 10:57:47'),
(3, '20240001', 'ca82d8a67832679fdc39c9156f087e31236b833ee7371eb3d6e081aeb90016c9', 'siswa', 'Santoso', '2026-05-30 10:57:47'),
(6, 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'Administrator', '2026-05-31 13:26:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `health_records`
--
ALTER TABLE `health_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `teacher_id` (`teacher_id`);

--
-- Indexes for table `schedule_students`
--
ALTER TABLE `schedule_students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nis` (`nis`),
  ADD KEY `idx_students_nis` (`nis`),
  ADD KEY `idx_students_status` (`status`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_users_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `health_records`
--
ALTER TABLE `health_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `schedule_students`
--
ALTER TABLE `schedule_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `health_records`
--
ALTER TABLE `health_records`
  ADD CONSTRAINT `health_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`);

--
-- Constraints for table `schedule_students`
--
ALTER TABLE `schedule_students`
  ADD CONSTRAINT `schedule_students_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedule_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
