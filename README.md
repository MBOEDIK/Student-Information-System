student-information-system/
├── database/
│   └── schema.sql         # Cetak biru database MySQL (sesuai workflow kemarin)
├── public/                # [FRONTEND] Tempat template HTML, CSS, & Vanilla JS
│   ├── css/
│   │   └── style.css      # Custom styling jika diperlukan
│   ├── js/
│   │   ├── auth.js        # Logika Vanilla JS untuk handle login/logout
│   │   ├── siswa.js       # Logika Vanilla JS untuk handle pendaftaran/pencarian siswa
│   │   └── guru.js        # Logika Vanilla JS untuk handle data guru
│   ├── index.html         # Halaman utama / Login
│   └── dashboard.html     # Halaman utama aplikasi setelah login
├── src/                   # [BACKEND] Tempat otak aplikasi (Express.js)
│   ├── config/
│   │   └── db.js          # Kode koneksi Express.js ke MySQL XAMPP
│   ├── controllers/
│   │   ├── authController.js   # Logika proses login & cek session
│   │   ├── siswaController.js  # Logika CRUD data siswa
│   │   └── guruController.js   # Logika CRUD data guru
│   ├── routes/
│   │   ├── authRoutes.js  # Jalur URL untuk login/logout
│   │   ├── siswaRoutes.js # Jalur URL untuk API data siswa
│   │   └── guruRoutes.js  # Jalur URL untuk API data guru
│   └── app.js             # File utama untuk menyalakan server Express
├── .gitignore             # File wajib agar rahasia & file sampah tidak masuk GitHub
├── package.json           # Daftar library/dependencies (Express, Mysql2, dll.)
└── README.md              # Catatan panduan cara menjalankan aplikasi untuk tim
