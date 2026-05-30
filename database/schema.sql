DROP TABLE IF EXISTS `students`;

CREATE TABLE `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nis` VARCHAR(20) NOT NULL UNIQUE,
  `nama` VARCHAR(150) NOT NULL,
  `jenis_kelamin` ENUM('Laki-laki', 'Perempuan') NOT NULL,
  `alamat` TEXT NOT NULL,
  `status` VARCHAR(20) DEFAULT 'aktif' NOT NULL
);

INSERT INTO `students` (`nis`, `nama`, `jenis_kelamin`, `alamat`, `status`) VALUES
('12345', 'Muhammad Budi Kusuma', 'Laki-laki', 'Jl. Sukarno Hatta No. 10, Malang', 'aktif'),
('12346', 'Siti Aminah', 'Perempuan', 'Jl. Borobudur No. 4, Malang', 'aktif'),
('12347', 'Dewi Lestari', 'Perempuan', 'Jl. Soekarno Hatta No. 22, Malang', 'aktif');