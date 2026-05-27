## 📁 Struktur Proyek (Project Structure)

Aplikasi ini menggunakan arsitektur **Single Repository (Monorepo Sederhana)**. Kode *Frontend* dan *Backend* disatukan di dalam satu proyek yang sama untuk mempermudah kolaborasi tim pemula.

```text
student-information-system/
├── database/
│   └── schema.sql         # [DATABASE] Cetak biru tabel MySQL (Ekspor khusus struktur)
├── public/                # [FRONTEND] Tempat template visual HTML, CSS, & JS Native
│   ├── css/
│   │   └── style.css      # Kumpulan custom styling tampilan tambahan
│   ├── js/
│   │   ├── auth.js        # Logika JavaScript untuk menangani Login & Logout
│   │   ├── siswa.js       # Logika JavaScript untuk CRUD data siswa (Fetch API)
│   │   └── guru.js        # Logika JavaScript untuk CRUD data guru (Fetch API)
│   ├── index.html         # Halaman utama (Form Login Awal)
│   └── dashboard.html     # Halaman utama aplikasi setelah berhasil login
├── src/                   # [BACKEND] Otak server aplikasi berbasis Express.js
│   ├── config/
│   │   └── db.js          # Konfigurasi koneksi database Node.js ke MySQL XAMPP
│   ├── controllers/
│   │   ├── authController.js   # Logika bisnis autentikasi session & enkripsi
│   │   ├── siswaController.js  # Pemrosesan query SQL untuk data siswa
│   │   └── guruController.js   # Pemrosesan query SQL untuk data guru
│   ├── routes/
│   │   ├── authRoutes.js  # Daftar URL/Endpoint untuk alur Login & Logout
│   │   ├── siswaRoutes.js # Daftar URL/Endpoint API untuk data siswa
│   │   └── guruRoutes.js  # Daftar URL/Endpoint API untuk data guru
│   └── app.js             # File utama untuk inisialisasi dan menjalankan server
├── .gitignore             # File pembatas agar folder 'node_modules' tidak terupload
├── package.json           # Daftar library dependencies proyek (Express, Mysql2, dll.)
└── README.md              # Dokumentasi panduan pengerjaan proyek tim
