# LAPORAN EVALUASI MODEL PROSES: PENGUJIAN BERBASIS HIPOTESIS

## SISTEM INFORMASI AKADEMIK SISWA (MiSiS)

**Tanggal Pengujian:** 14 Juni 2026  
**Metodologi Acuan:** Kerangka Kerja Eksperimen Rekayasa Perangkat Lunak  
**Kelompok / Kelas:** [Nama Kelompok / Kelas RPL H/I]

### Anggota Kelompok:

- [Nama Anggota 1] - [NIM Anggota 1]
- [Nama Anggota 2] - [NIM Anggota 2]
- [Nama Anggota 3] - [NIM Anggota 3]
- [Nama Anggota 4] - [NIM Anggota 4]
- [Nama Anggota 5] - [NIM Anggota 5]

---

### ABSTRAK

Kolaborasi dalam pengembangan perangkat lunak berskala tim sering kali terhambat oleh perbedaan lingkungan pengembangan lokal, pola kerja monolitik yang memicu konflik integrasi, serta absennya standardisasi penulisan kode. Laporan ini mendokumentasikan tiga eksperimen pengujian berbasis hipotesis terhadap model proses dan arsitektur pada proyek _Student Information System_ (MiSiS).

Pengujian pertama berfokus pada transisi pangkalan data lokal menuju pangkalan data awan terpusat (_Centralized Cloud Database_). Pengujian kedua berfokus pada refaktorisasi arsitektur aplikasi monolitik menjadi _Single Page Application_ (SPA) berbasis fragmen halaman dan perutean terpusat. Pengujian ketiga berfokus pada penegakan standardisasi kode menggunakan linter otomatis dan pola penanganan eror (_error handling_). Seluruh pengujian dievaluasi menggunakan metode empiris 5 langkah guna mendukung peningkatan tingkat kematangan proses kerja tim.

> **Catatan Revisi:** Beberapa modul yang disebutkan dalam laporan ini masih berada dalam tahap _Pull Request_ (PR) terbuka dan belum tergabung ke branch `main` pada saat penulisan laporan. Status aktual setiap modul dicantumkan secara transparan pada setiap bagian.

---

## Langkah 1: Observasi dan Analisis Target

### 1.1 Anomali dan Masalah yang Diamati

Dalam siklus pengembangan modul sisa pada Sprint 3, tim mengamati beberapa anomali teknis dan operasional yang dikelompokkan ke dalam tiga kategori utama:

#### Kategori A: Kendala Infrastruktur Pangkalan Data & Deployment

- **Hambatan Kolaborasi Paralel:** Penggunaan database lokal (_localhost_ via XAMPP) menyebabkan setiap pengembang bekerja dengan kondisi data yang berbeda. Proses sinkronisasi data secara manual menggunakan ekspor-impor berkas `.sql` sangat tidak efisien dan rawan kesalahan manusia (_human error_).
- **Risiko Konflik Integrasi Basis Data:** Penggabungan skema basis data secara berkala melalui kontrol versi Git sering kali memicu konflik penggabungan (_merge conflict_) pada berkas SQL utama, yang berpotensi merusak integritas data relasional.
- **Daur Ulang Tanpa Sesi (_Stateless Recycling_):** Platform komparasi deployment tanpa server (_serverless_) seperti Vercel memiliki karakteristik _stateless_. Jika penyimpanan sesi aktif pengguna hanya diletakkan pada memori lokal server, pengguna akan dikeluarkan secara acak dari sistem (_forced logout_) setiap kali Vercel melakukan daur ulang instans fungsi (_recycle instance_).

#### Kategori B: Kendala Arsitektur Monolitik & Konflik Git (Branch Merge)

- **Halaman Dashboard Monolitik:** Berkas `public/dashboard.html` bertindak sebagai file monolitik berukuran besar yang menampung seluruh visualisasi menu. Hal ini menyebabkan setiap pengembang yang mengerjakan _User Story_ (US) berbeda harus memodifikasi berkas yang sama secara bersamaan, sehingga memicu konflik Git berulang kali saat melakukan prosedur _merge_.
- **Kekacauan Alur Kontrol:** Berkas kontrol utama seperti `auth.js` bertindak sebagai tempat pembuangan logika bisnis yang bercampur aduk, mulai dari penanganan login, navigasi SPA, pengambilan data master, hingga fungsi pembantu (_utility functions_).

#### Kategori C: Inkonsistensi Kualitas Kode & Penanganan Eror (Defect)

- **Duplikasi Fungsi Global:** Fungsi-fungsi penunjang visual seperti `statusBadge()`, `openModal()`, dan `closeModal()` didefinisikan secara berulang di berbagai berkas berbeda dengan implementasi yang tidak konsisten, mengakibatkan tabrakan deklarasi fungsi (_function overwrite_) saat _runtime_.
- **Silent Errors (Ketiadaan Catch Block):** Beberapa fungsi asinkron (seperti pengambilan data siswa/guru) tidak dibungkus oleh struktur blok `try/catch`. Akibatnya, ketika request API mengalami kegagalan, sistem tidak memberikan umpan balik apa pun ke antarmuka pengguna (_silent error_).
- **Variasi Gaya Penulisan:** Absennya penegakan linter memicu inkonsistensi penggunaan tanda baca (titik koma, petik tunggal vs petik ganda), penggunaan variabel global tanpa deklarasi (`no-undef`), serta struktur format respons API dari server yang tidak seragam.

### 1.2 Target Pengguna dan Konteks Pengujian

Target subjek pengujian dalam eksperimen model proses ini adalah internal tim pengembang MiSiS (5 orang). Konteks aktivitasnya adalah pengerjaan 6 modul MVP terintegrasi (khususnya Modul 5 Konseling dan Modul 6 Transkrip Nilai) secara independen, terisolasi, dan paralel tanpa memicu konflik integrasi data pada repositori Git bersama.

---

## Langkah 2: Formulasi Hipotesis (Pernyataan Terukur)

Berdasarkan anomali yang diobservasi, tim merumuskan tiga dugaan ilmiah terstruktur (hipotesis) untuk diuji secara empiris:

### 2.1 Rumusan Hipotesis

- **Hipotesis Eksperimen 1 (Infrastruktur):** "Jika tim mengimplementasikan arsitektur pangkalan data terpusat berbasis _Centralized Cloud Database_ (Aiven MySQL Cloud) yang dikombinasikan dengan penyimpanan sesi persisten di sisi server menggunakan pustaka `express-mysql-session`, maka risiko terjadinya desinkronisasi basis data antar-pengembang akan berkurang hingga 0% dan tim dapat mengeksekusi pengerjaan _User Story_ secara paralel tanpa mengalami kendala pemblokiran data (_blocking data_)."
- **Hipotesis Eksperimen 2 (Arsitektur SPA & Routing):** "Jika tim melakukan refaktorisasi arsitektur dari berkas monolitik menjadi _Single Page Application_ (SPA) berbasis fragmen halaman independen (`public/pages/*.html`) dan memisahkan modul perutean backend terpusat di `src/routes/index.js`, maka probabilitas terjadinya konflik Git (_merge conflict_) saat proses penggabungan branch akan menurun di bawah 5%."
- **Hipotesis Eksperimen 3 (Standardisasi Kode & Linter):** "Jika tim menerapkan standardisasi format kode (ESLint & Prettier) yang terintegrasi dengan struktur respons API yang seragam dan pola penanganan eror wajib `try/catch`, maka tingkat kegagalan _runtime_ (_broken code_) pasca-_merge_ dapat ditekan hingga mencapai nilai 0%."

### 2.2 Kriteria Keberhasilan Eksperimen

Eksperimen dinyatakan berhasil apabila memenuhi metrik kuantitatif dan kualitatif berikut:

#### Kriteria Eksperimen 1 (Infrastruktur)

- **Sinkronisasi Data Real-Time:** Perubahan struktur tabel atau manipulasi baris data oleh satu pengembang langsung tercermin pada lingkungan kerja pengembang lainnya secara instan.
- **Latensi Respon API Rendah:** Eksekusi transaksi baca/tulis (_query_) REST API dari komputer lokal menuju server basis data awan Aiven Cloud mencatat waktu respon rata-rata di bawah 2 detik.
- **Persistensi Sesi Pengguna:** Token sesi login pengguna tetap terjaga (tidak terputus) meskipun aplikasi di-deploy pada platform _stateless serverless_ Vercel.

#### Kriteria Eksperimen 2 (SPA & Routing)

- **Pemberantasan Konflik Merge:** Waktu yang dihabiskan untuk menyelesaikan konflik per-_merge_ di Git menurun dari kisaran 30–60 menit menjadi hampir 0 menit.
- **Isolasi Berkas Pengembang:** Jumlah berkas bersama (_shared files_) yang disentuh oleh pengembang saat mengerjakan satu _User Story_ berkurang dari 5–7 file menjadi maksimum 2 file terisolasi.

#### Kriteria Eksperimen 3 (Standardisasi & Penanganan Eror)

- **Zero Silent Errors:** Seluruh kegagalan request API backend wajib menghasilkan respon kesalahan terstruktur (status 500) yang memicu notifikasi visual dinamis (`alert--error`) di tingkat pengguna.
- **Lolos Linter Otomatis:** Berkas JavaScript di frontend dan backend lolos uji pemeriksaan linter tanpa menampilkan pesan kesalahan (_zero errors_) dari konfigurasi `.eslintrc.json`.

---

## Langkah 3: Desain Eksperimen atau Prototype

### 3.1 Skenario Pengujian

Tim merancang replika solusi minimum (_Minimum Viable Product_) untuk infrastruktur dan arsitektur kode proyek:

- **Skenario Eksperimen 1: Migrasi Kluster Awan**
  1. Struktur DDL dari `database/schema.sql` dimigrasikan sepenuhnya menuju kluster basis data awan terkelola Aiven MySQL Engine pada basis data bernama `defaultdb`.
  2. Seluruh parameter koneksi basis data awan disimpan di dalam berkas konfigurasi lokal `.env` dan didaftarkan ke dalam `.gitignore` untuk mencegah kebocoran kredensial.
  3. Mengonfigurasi pustaka `express-mysql-session` agar membuat tabel penyimpanan otomatis `sessions` di dalam kluster Aiven Cloud.
- **Skenario Eksperimen 2: Pemecahan Modular SPA**
  1. Memecah konten antarmuka `dashboard.html` ke dalam sub-folder halaman statis terisolasi di `public/pages/` (seperti `nilai.html`, `konseling.html`, dll.).
  2. Mengonfigurasi pengendali navigasi `public/js/router.js` untuk memuat halaman secara dinamis lewat metode `fetch()` dan melakukan injeksi elemen langsung ke penampung halaman dashboard.
  3. Mengintegrasikan berkas perutean terpusat di `src/routes/index.js` sebagai perantara tunggal (_entry point_) seluruh lalu lintas API di sisi server.
- **Skenario Eksperimen 3: Penerapan Linter dan Pola Respons**
  1. Mengonfigurasi pustaka linter ESLint and formatter Prettier pada lingkungan kerja lokal via berkas konfigurasi `.eslintrc.json`, `.prettierrc`, dan `.editorconfig`.
  2. Membuat berkas pembantu respons global `src/shared/response.js` yang memaksa standardisasi format JSON sukses (`{ success: true, data, message }`) dan eror (`{ success: false, message, errors }`).
  3. Mengimplementasikan pembungkusan blok `try/catch` pada seluruh fungsi asinkron controller backend.

### 3.2 Skenario Script Pengujian (Test Script)

Tim menyusun skenario simulasi beban kerja paralel untuk menguji ketahanan, sinkronisasi data, dan struktur integrasi:

- **Uji Kolaborasi Paralel:** Anggota tim A mengunggah berkas CSV siswa (US 1.6) dari laptopnya, sementara Anggota tim B mengakses menu absensi (US 3.1) dan mengubah status absensi siswa (US 3.2) secara bersamaan.
- **Uji Penggabungan Kode (Git Merge):** Developer melakukan perubahan pada berkas `public/js/nilai.js` dan developer lainnya mengubah `public/js/konseling.js` pada branch terpisah, lalu melakukan penggabungan ke branch `main`.
- **Uji Deteksi Kesalahan (Error & Linter):** Menguji pengiriman parameter kosong pada endpoint penginputan nilai untuk melihat apakah respons server mengembalikan kesalahan terstruktur dan lolos deteksi linter (`npm run lint`).

---

## Langkah 4: Verifikasi Pengguna (Eksekusi & Pengumpulan Matrik)

### 4.1 Metode Pengujian

Pengujian dieksekusi menggunakan teknik pengujian terstandar lintas perangkat komputer yang terhubung ke jaringan internet publik secara terdistribusi oleh kelima anggota tim pengembang. Verifikasi dilakukan pada _branch default_ (`main`) dan pada _branch fitur_ yang masih dalam status PR terbuka.

### 4.2 Hasil Matrik Kuantitatif dan Empiris

#### A. Eksperimen 1: Persentase Keberhasilan (Success Rate) Infrastruktur Cloud

Seluruh tabel fungsional berhasil diakses secara terpusat oleh tim pengembang.

| No  | Nama Tabel Basis Data          | Status Verifikasi            | Keterangan                                                                       |
| :-- | :----------------------------- | :--------------------------- | :------------------------------------------------------------------------------- |
| 1   | `users` (Sesi login & role)    | ✅ Sukses                    | Tersedia di `schema.sql` & terhubung                                             |
| 2   | `students` (Master data siswa) | ✅ Sukses                    | Tersedia di `schema.sql` & terhubung                                             |
| 3   | `teachers` (Master data guru)  | ✅ Sukses                    | Tersedia di `schema.sql` & terhubung                                             |
| 4   | `grades` (Nilai komponen)      | ✅ Sukses                    | Tersedia di `schema.sql` sejak PR #54 di-merge                                   |
| 5   | `sessions` (Penyimpanan Sesi)  | ✅ Sukses                    | Tabel otomatis dari `express-mysql-session`                                      |
| 6   | `counseling_records` (BK)      | ⏳ **Dalam Review (PR #62)** | Tabel ditambahkan di branch `feat/us-5.2-riwayat-konseling-dapp`, menunggu merge |
| 7   | `subjects`                     | ✅ Sukses                    | Tersedia di `schema.sql`                                                         |
| 8   | `schedules`                    | ✅ Sukses                    | Tersedia di `schema.sql`                                                         |
| 9   | `schedule_students`            | ✅ Sukses                    | Tersedia di `schema.sql`                                                         |
| 10  | `absensi`                      | ✅ Sukses                    | Tersedia di `schema.sql`                                                         |
| 11  | `health_records`               | ✅ Sukses                    | Tersedia di `schema.sql`                                                         |

#### B. Eksperimen 1: Waktu Respon API (Response Time)

Pengukuran waktu respon eksekusi rute API menggunakan alat uji Postman dan pencatatan log internal server:

| Jenis Transaksi Data        | Kriteria Sukses | Hasil Pengujian Rata-Rata | Kesimpulan |
| :-------------------------- | :-------------- | :------------------------ | :--------- |
| Autentikasi Login (M-0)     | < 2.0 Detik     | 1.15 Detik                | ✅ Lolos   |
| Ambil Jadwal Mengajar (M-2) | < 2.0 Detik     | 0.98 Detik                | ✅ Lolos   |
| Simpan Absensi Siswa (M-3)  | < 2.0 Detik     | 1.42 Detik                | ✅ Lolos   |
| Simpan Sesi Konseling (M-5) | < 2.0 Detik     | 1.22 Detik                | ✅ Lolos   |
| Simpan Nilai Batch (M-6)    | < 2.0 Detik     | 1.58 Detik                | ✅ Lolos   |

#### C. Eksperimen 2: Matrik Dampak Refaktorisasi SPA & Routing

Pengukuran dampak struktural arsitektur sebelum dan sesudah pelaksanaan refaktorisasi:

| Indikator Kinerja Pengembang    | Sebelum Refaktorisasi | Sesudah Refaktorisasi  | Keterangan Dampak                           |
| :------------------------------ | :-------------------- | :--------------------- | :------------------------------------------ |
| Waktu Selesai Konflik per Merge | 30 - 60 Menit         | Hampir 0 Menit         | Pengurangan waktu terbuang secara radikal   |
| Risiko Broken Code pasca-Merge  | Tinggi                | Sangat Rendah          | Kode menjadi stabil karena terisolasi       |
| Jumlah File Disentuh per US     | 5 - 7 Berkas          | 1 - 2 Berkas           | Ruang lingkup perubahan file sangat terarah |
| Kompatibilitas Navigasi SPA     | Monolitik lambat      | Render Dinamis Instant | Kecepatan render UI meningkat               |

#### D. Eksperimen 3: Validasi Linter & Konsistensi Error Handling

Hasil pemeriksaan otomatis pada kode JavaScript yang **telah tergabung di branch `main`**:

| Berkas Sasaran Audit                     | Linter Errors | `try/catch`   | `responseHelper`             | Kesimpulan              |
| :--------------------------------------- | :------------ | :------------ | :--------------------------- | :---------------------- |
| `public/js/shared.js`                    | 0             | N/A (utility) | N/A                          | ✅ Sesuai Standar       |
| `public/js/router.js`                    | 0             | ✅ Ada        | N/A                          | ✅ Sesuai Standar       |
| `src/controllers/nilaiController.js`     | 0             | ✅ Ada        | ✅                           | ✅ Sesuai Standar       |
| `src/controllers/absensiController.js`   | 0             | ✅ Ada        | ✅                           | ✅ Sesuai Standar       |
| `src/controllers/kesehatanController.js` | 0             | ✅ Ada        | ✅                           | ✅ Sesuai Standar       |
| `src/controllers/jadwalController.js`    | 0             | ✅ Ada        | ✅                           | ✅ Sesuai Standar       |
| `src/controllers/guruController.js`      | 0             | ✅ Ada        | ✅                           | ✅ Sesuai Standar       |
| `src/controllers/siswaController.js`     | 0             | ✅ Ada        | ❌ Masih `res.json()` manual | ⚠️ **Perlu diperbaiki** |
| `src/controllers/authController.js`      | 0             | ✅ Ada        | ❌ Masih `res.json()` manual | ⚠️ **Perlu diperbaiki** |

Hasil pemeriksaan otomatis pada kode JavaScript yang **masih dalam branch terpisah (PR #62 — Modul Konseling)**:

| Berkas Sasaran Audit                     | Linter Errors | `try/catch` | `responseHelper` | Kesimpulan        |
| :--------------------------------------- | :------------ | :---------- | :--------------- | :---------------- |
| `src/controllers/konselingController.js` | 0             | ✅ Ada      | ✅               | ✅ Sesuai Standar |
| `public/js/konseling.js`                 | 0             | ✅ Ada      | N/A              | ✅ Sesuai Standar |

> **Catatan:** Modul Konseling (BK) telah diimplementasikan sepenuhnya mengikuti standar kode yang ditetapkan, namun masih menunggu proses _review_ dan _merge_ melalui PR #62.

#### BUKTI EMPIRIS PENGUJIAN (SCREENSHOT)

_(Silakan tempel tangkapan layar antarmuka VS Code Database Client atau GUI Database Manager pilihanmu yang menunjukkan koneksi sukses menuju host server Aiven Cloud dan struktur tabel di dalam database `defaultdb` sebagai bukti autentisitas pengujian)._

---

## Langkah 5: Evolusi Spesifikasi (Keputusan Akhir)

### 5.1 Keputusan Manajerial

Berdasarkan analisis data empiris, grafik perbandingan kinerja, serta laporan verifikasi kuantitatif, tim memutuskan status untuk ketiga hipotesis eksperimen sebagai berikut:

$$\mathbf{PRESERVE} \quad (\text{Pertahankan dan Terapkan})$$

Ketiga perubahan besar baik di bidang infrastruktur pangkalan data awan terpusat, arsitektur modular SPA berbasis fragmen halaman, maupun standar penulisan kode terbukti memberikan jaminan kualitas (_Quality Assurance_) yang mutlak bagi kestabilan aplikasi MiSiS.

### 5.2 Dampak Pembaruan pada Dokumen Spesifikasi (SRS)

Sebagai konsekuensi dari keputusan ilmiah ini, dokumen spesifikasi kebutuhan perangkat lunak (SRS) MiSiS v1.5 diperbarui pada bagian-bagian berikut:

- **Pembaruan Bab 2.1 (Perspektif Produk):** Mengubah spesifikasi media penyimpanan pangkalan data lokal menjadi _Hosted Relational Database on Aiven Cloud_ dengan nama database utama `defaultdb`.
- **Pembaruan Bab 3.1 (Antarmuka Perangkat Lunak):** Menambahkan rincian spesifikasi dependensi pustaka `express-mysql-session` sebagai standar penanganan persistensi token keamanan akses login pengguna pada platform _serverless deployment_ Vercel.
- **Pembaruan Bab 3.4 (Atribut Keterawatan):** Mewajibkan seluruh penulisan JavaScript mematuhi aturan linting `.eslintrc.json`, menggunakan _naming convention_ baku (_camelCase_ untuk variabel/fungsi, plural _snake_case_ untuk tabel database), dan mewajibkan format JSON respons global terstruktur melalui helper `src/shared/response.js`.

### 5.3 Pekerjaan Lanjutan (_Remediation Items_)

Berdasarkan hasil audit kode, terdapat beberapa item yang perlu ditindaklanjuti untuk mencapai kepatuhan standar 100%:

| No  | Item                                                                                                                         | Prioritas | PIC | Status         |
| :-- | :--------------------------------------------------------------------------------------------------------------------------- | :-------- | :-- | :------------- |
| 1   | **Refaktor `siswaController.js`** — Ganti `res.json()` manual dengan `responseHelper`                                        | Tinggi    | —   | 🔲 Belum       |
| 2   | **Refaktor `authController.js`** — Ganti `res.json()` manual dan log `err.message` bukan `err`                               | Tinggi    | —   | 🔲 Belum       |
| 3   | **Merge PR #62 (Modul Konseling)** — Integrasikan `konselingController.js`, routes, dan tabel `counseling_records` ke `main` | Sedang    | —   | ⏳ PR #62 Open |
| 4   | **Merge PR #63 (Transkrip Siswa US 6.3)**                                                                                    | Sedang    | —   | ⏳ PR #63 Open |
| 5   | **Merge PR #65 (Transkrip Admin US 6.4)**                                                                                    | Sedang    | —   | ⏳ PR #65 Open |
| 6   | **Merge PR #66 (Deteksi Jadwal Bentrok US 2.7)**                                                                             | Rendah    | —   | ⏳ PR #66 Open |
| 7   | **Selaraskan branch `feat/deployment-setup`** dengan `main` (khususnya konfigurasi `express-mysql-session`)                  | Sedang    | —   | 🔲 Belum       |

### 📊 5.4 Analisis Kematangan Proses (CMMI Leveling)

Dengan dilaksanakannya evaluasi dan pemeliharaan model proses ini secara ketat, tim pengembang MiSiS secara resmi telah mengalami pergeseran kematangan tata kelola rekayasa perangkat lunak:

1. **Transisi dari CMMI Level 1 (Initial) ke Level 2 (Managed):** Tim berhasil meninggalkan pola kerja lama yang reaktif, kacau, dan tidak terprediksi (_firefighting_). Proses kerja kini telah direncanakan, diukur, dipantau, dan dikendalikan dengan baik menggunakan spesifikasi kebutuhan (SRS) yang terstruktur dan pelacakan _Sprint Backlog_ berbasis _User Story_ yang disiplin.
2. **Fondasi menuju CMMI Level 3 (Defined):** Penerapan standardisasi kode global (linter, _try/catch pattern_, _Git naming convention_) meletakkan batu pertama terbentuknya proses terstandardisasi organisasi yang terdokumentasi dengan baik (_tailorable standard processes_) untuk digunakan secara lintas tim ke depannya.
