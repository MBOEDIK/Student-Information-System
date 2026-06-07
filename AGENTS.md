# Aturan Wajib untuk AI Agent — SIS MiSiS Project

Aturan ini diwarisi dari `AI_RULES.md` + hasil review proyek. WAJIB dibaca sebelum menulis kode apapun.

---

## 1. Sebelum Nulis, BACA DULU yang Sudah Ada

Buka minimal 2 file existing di direktori yang sama sebelum membuat file baru. Contoh:

- Sebelum buat controller baru → baca `siswaController.js` dan `jadwalController.js`
- Sebelum buat halaman HTML baru → baca `pendaftaran.html` (form) atau `siswa.html` (tabel)

---

## 2. Naming Conventions

| Konteks           | Aturan                               | Contoh                          |
| ----------------- | ------------------------------------ | ------------------------------- |
| File Backend JS   | camelCase                            | `authController.js`             |
| File Frontend JS  | kebab-case                           | `page-siswa.js`                 |
| File HTML         | kebab-case                           | `pendaftaran.html`              |
| Variabel & Fungsi | camelCase, fungsi diawali kata kerja | `sessionData`, `getAllSiswa()`  |
| Konstanta         | UPPER_SNAKE_CASE                     | `PORT`, `DB_HOST`               |
| Tabel Database    | Plural (jamak) & snake_case          | `students`, `schedules`         |
| Kolom Database    | snake_case                           | `created_at`, `nama_lengkap`    |
| Class CSS         | BEM                                  | `stat-card`, `stat-card__value` |

---

## 3. Route & Variable Import

- **WAJIB**: `const namaCtrl = require(...)` — suffix `Ctrl`
  - ✅ `const siswaCtrl = require('../controllers/siswaController');`
  - ❌ `const siswaController = require(...)`
- **WAJIB**: `const pool = require('../config/db');` — nama `pool`, bukan `db`
  - ✅ `const pool = require('../config/db');`
  - ❌ `const db = require('../config/db');`

---

## 4. Error Handling & Database Pattern

```javascript
exports.getFiturData = async (req, res) => {
  try {
    // WAJIB parameterized query
    const [rows] = await pool.query('SELECT * FROM table WHERE id = ?', [req.params.id]);
    return responseHelper.success(res, rows, 'Data berhasil diambil');
  } catch (err) {
    // Format: [NAMA_MODUL] namaFungsi: err.message
    console.error('[NAMA_MODUL] namaFungsi:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};
```

- **WAJIB** parameterized query (`?` placeholder), JANGAN concatenate SQL
- **WAJIB** console.error dengan prefix `[NAMA_MODUL]` dan nama fungsi
- **WAJIB** log `err.message`, bukan `err` (stack trace tidak perlu ke production)

---

## 5. API Response — WAJIB Pakai responseHelper

DILARANG response JSON manual. Gunakan `src/shared/response.js`:

- ✅ `return responseHelper.success(res, data, 'Pesan', statusCode);`
- ✅ `return responseHelper.error(res, 'Pesan', statusCode, errors);`
- ❌ `return res.status(200).json({ success: true, message: '...', data });`

---

## 6. Frontend — HTML & CSS

### 6a. DILARANG Inline Styles

Gunakan class dari `public/css/components.css`:

| Komponen                  | Class Wajib                                       |
| ------------------------- | ------------------------------------------------- |
| Container halaman         | `class="page active"`                             |
| Header                    | `class="page-header"` dengan `<h1>`               |
| Container form            | `<div class="card"><div class="card__body">`      |
| Label                     | `class="form-label"`                              |
| Input / Select / Textarea | `class="form-input"`                              |
| Wrapper form-group        | `class="form-group"`                              |
| Tombol                    | `class="btn"` + `btn--primary` / `btn--secondary` |
| Notifikasi                | `class="alert alert--success"` / `alert--error`   |
| Wrapper tabel             | `class="table-wrapper"`                           |
| Badge                     | `class="badge badge--green/gray/red"`             |

### 6b. DILARANG Hardcode Warna

WAJIB pakai CSS variables dari `public/css/base.css`:

✅ `var(--primary)`, `var(--success)`, `var(--danger)`, `var(--warning)`, `var(--border)`, `var(--text-muted)`  
❌ `#007bff`, `#28a745`, `#dc3545`, `#6c757d`, `#ccc`, `#dee2e6`, `#f8f9fa`

### 6c. Judul Halaman

- Maksimal 4 kata, **DILARANG emoji** di `<h1>`
- ✅ "Catatan Kesehatan", "Laporan Absensi"
- ❌ "🩺 Formulir Pencatatan Riwayat Kesehatan Siswa"

### 6d. Tabel

Pakai `<table>` polos tanpa inline style. `<thead>` otomatis bergaya gelap (`--sidebar-bg`). JANGAN timpa dengan `#f8f9fa`.

---

## 7. Database

### 7a. DDL Tabel Baru → `database/schema.sql`

Setiap tabel baru WAJIB ditambahkan ke `database/schema.sql`, bukan ke file terpisah. Buka `schema.sql`, lalu tambahkan `CREATE TABLE IF NOT EXISTS ...` di bagian akhir dengan komentar header yang jelas.

```sql
-- ============================================================
-- TABEL: nama_tabel (deskripsi singkat)
-- ============================================================
CREATE TABLE IF NOT EXISTS nama_tabel (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  ...
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 7b. Seed Data → `database/seed.sql`

Setiap tabel baru WAJIB ditambahkan data contoh ke `database/seed.sql`. Buka `seed.sql`, lalu tambahkan `TRUNCATE TABLE` dan `INSERT INTO` di bagian akhir.

```sql
-- ── Nama Tabel (Deskripsi) ─────────────────────────────────
TRUNCATE TABLE nama_tabel;

INSERT INTO nama_tabel (kolom1, kolom2) VALUES
(nilai1, nilai2),
(nilai3, nilai4);
```

### 7c. Cek Existing Schema Sebelum JOIN

- Tabel siswa = `students` (bukan `siswa`)
- Buka `schema.sql` untuk cek nama tabel & kolom sebelum menulis JOIN
- Buka controller yang sudah ada untuk lihat pola query

---

## 8. Wajib Jalankan Tooling Sebelum Selesai

```bash
npx prettier --write "public/pages/*.html" "public/css/*.css" "src/**/*.js"
npx eslint --fix "src/controllers/*.js" "src/routes/*.js"
```

Pastikan tidak ada error ESLint yang tersisa.

---

## 9. Git Commit Message

Gunakan Conventional Commits: `feat(scope):`, `fix(scope):`, `refactor(scope):`, `style(scope):`
