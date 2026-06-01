## 📁 Struktur Proyek (Project Structure)

Aplikasi menggunakan arsitektur **Single Repository (Monorepo Sederhana)** dengan pendekatan **SPA (Single Page Application)** pada sisi frontend. Seluruh routing halaman ditangani oleh *client-side router* tanpa reload halaman.

```text
student-information-system/
├── database/
│   ├── schema.sql             # [DATABASE] Cetak biru tabel (users, students, teachers)
│   └── seed.sql               # [DATABASE] Data contoh untuk pengujian
├── public/                    # [FRONTEND] Template visual HTML, CSS, & JS Native
│   ├── css/
│   │   ├── base.css           # Variabel CSS & reset global
│   │   ├── layout.css         # Layout login, sidebar, dashboard, responsive
│   │   ├── components.css     # Komponen UI: form, button, table, modal, alert
│   │   └── style.css          # Entry point CSS (mengimpor base, layout, components)
│   ├── js/
│   │   ├── auth.js            # Login/logout + session check + role-based menu
│   │   ├── router.js          # Client-side SPA router & role-based access
│   │   ├── shared.js          # Utilitas: modal, alert, statusBadge, API helper
│   │   ├── siswa.js           # CRUD + pencarian data siswa
│   │   └── guru.js            # CRUD data guru
│   ├── pages/                 # [SPA] Fragment halaman yang dimuat router
│   │   ├── home.html          # Dashboard (statistik siswa & guru)
│   │   ├── siswa.html         # Tabel data siswa + pencarian
│   │   ├── guru.html          # Tabel data guru
│   │   ├── pendaftaran.html   # Form pendaftaran siswa baru
│   │   ├── jadwal.html        # ⏳ (placeholder)
│   │   ├── absensi.html       # ⏳ (placeholder)
│   │   ├── nilai.html         # ⏳ (placeholder)
│   │   ├── kesehatan.html     # ⏳ (placeholder)
│   │   └── konseling.html     # ⏳ (placeholder)
│   ├── index.html             # Halaman login
│   └── dashboard.html         # Layout utama setelah login (sidebar + SPA container)
├── src/                       # [BACKEND] Server Express.js
│   ├── config/
│   │   └── db.js              # Koneksi MySQL via mysql2/promise pool
│   ├── controllers/
│   │   ├── authController.js  # Login/logout + session + SHA-256
│   │   ├── siswaController.js # CRUD + search + stats siswa
│   │   └── guruController.js  # CRUD + stats guru
│   ├── routes/
│   │   ├── index.js           # Route aggregator (/api/auth, /api/siswa, /api/guru)
│   │   ├── authRoutes.js      # POST /login, POST /logout, GET /check
│   │   ├── siswaRoutes.js     # GET /, /search, /stats, /:id | POST /register | PUT /:id
│   │   └── guruRoutes.js      # GET /, /stats, /:id | PUT /:id
│   └── app.js                 # Entry point server (Express + Session + Static)
├── .gitignore                 # node_modules/, .env, .DS_Store
├── package.json               # Dependencies: express, mysql2, express-session, dotenv
└── README.md                  # Dokumentasi proyek
```
