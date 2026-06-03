# AI Agent Coding Rules & Conventions - SIS MiSiS Project

Kamu adalah AI Agent yang bertugas menulis kode di dalam repositori ini. Kamu WAJIB mematuhi aturan penamaan, pola error handling, dan struktur respons yang sudah ditetapkan oleh tim pengembang di bawah ini.

## 📌 1. Naming Conventions
- **File Backend JS:** camelCase (Contoh: authController.js).
- **File Frontend JS:** kebab-case (Contoh: page-siswa.js).
- **File HTML:** kebab-case (Contoh: pendaftaran.html).
- **Variabel & Fungsi:** camelCase. Khusus fungsi wajib diawali kata kerja (Contoh: sessionData, getAllSiswa()).
- **Konstanta:** UPPER_SNAKE_CASE (Contoh: PORT, DB_HOST).
- **Tabel Database:** Plural (Jamak) & snake_case (Contoh: students, schedules).
- **Kolom Database:** snake_case (Contoh: created_at, nama_lengkap).
- **Class CSS:** Menggunakan konvensi BEM (Contoh: stat-card, stat-card__value).

## 📌 2. Error Handling & Security Pattern
Setiap fungsi asinkron (async/await) WAJIB dibungkus menggunakan blok try/catch dengan logging spesifik di bagian catch, serta wajib menggunakan parameterized query untuk keamanan database:

```javascript
exports.getFiturData = async (req, res) => {
  try {
    // WAJIB Menggunakan Parameterized Query untuk mencegah SQL Injection
    const [rows] = await pool.query('SELECT * FROM table_name WHERE id = ?', [req.params.id]);
    return responseHelper.success(res, rows, 'Data berhasil diambil');
  } catch (err) {
    // Format logging error wajib mencantumkan [NAMA_MODUL] dan namaFungsi
    console.error('[NAMA_MODUL] namaFungsi:', err.message);
    return responseHelper.error(res, 'Gagal memproses permintaan', 500);
  }
};
```

## 📌 3. API Response Standardization
DILARANG mengembalikan respons JSON mentah secara manual. Gunakan selalu helper global dari `src/shared/response.js` untuk mengembalikan respons HTTP Express:
- **Respons Sukses:** `return responseHelper.success(res, data, 'Pesan opsional', status_code);`
- **Respons Eror:** `return responseHelper.error(res, 'Pesan eror', status_code, array_errors);`

## 📌 4. Git Commit Message Convention
Jika diminta membuatkan pesan commit atau instruksi Git, patuhi format Conventional Commits berikut:
- `feat(scope):` untuk pengembangan fitur baru.
- `fix(scope):` untuk perbaikan bug atau eror.
- `refactor(scope):` untuk perbaikan struktur kode tanpa mengubah fungsi.
- `style(scope):` untuk merapikan format tampilan/spacing kode.
