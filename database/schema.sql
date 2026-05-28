CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nis VARCHAR(20) UNIQUE NOT NULL,
  kelas VARCHAR(20),
  alamat TEXT,
  status ENUM('Aktif', 'Non-Aktif') DEFAULT 'Aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nip VARCHAR(20) UNIQUE NOT NULL,
  mata_pelajaran VARCHAR(50),
  alamat TEXT,
  status ENUM('Aktif', 'Non-Aktif') DEFAULT 'Aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data dummy untuk testing
INSERT INTO students (nama, nis, kelas, alamat, status) VALUES
('Budi Santoso', '2024001', 'X-A', 'Jl. Merdeka No.1', 'Aktif'),
('Siti Rahayu', '2024002', 'X-B', 'Jl. Sudirman No.5', 'Aktif');

INSERT INTO teachers (nama, nip, mata_pelajaran, alamat, status) VALUES
('Pak Ahmad', '198501012010011001', 'Matematika', 'Jl. Pahlawan No.3', 'Aktif'),
('Bu Dewi', '199002022015012001', 'Bahasa Indonesia', 'Jl. Veteran No.7', 'Aktif');