# Master List User Stories: Student Information System (MiSiS)

**Peruntukan:** Product Owner (PO) & Tim Pengembang (Developers)  
**Tujuan:** Daftar kebutuhan fungsional lengkap (tanpa detail teknis dan kriteria penerimaan) sebagai basis pemahaman AI Agent OpenCode.

---

## 👥 AKTOR SISTEM (SYSTEM ACTORS)

1. **Admin / Staf Sekolah:** Pengelola sistem yang memiliki otoritas penuh terhadap data master (siswa, guru, kelas, jadwal).
2. **Guru / Dosen / Konselor:** Pengguna yang melakukan interaksi belajar-mengajar, absensi, penilaian, dan bimbingan.
3. **Siswa:** Pengguna yang menerima layanan pendidikan dan mengakses data pribadi mereka.

---

## 📊 TRACKING FITUR & SPRINT BACKLOG

### - [x] 0. AUTENTIKASI & KEAMANAN `[Sprint 1]`

- **US 0.1 (Semua Aktor):** Sebagai Pengguna (Admin/Guru/Siswa), saya ingin melakukan login menggunakan username/nomor induk dan password agar saya bisa masuk ke halaman dashboard sesuai dengan peran saya.
- **US 0.2 (Semua Aktor):** Sebagai Pengguna, saya ingin melakukan logout dari sistem setelah selesai menggunakan aplikasi agar akun saya tetap aman dari penyalahgunaan.

### - [x] 1. PENDAFTARAN & DATA MASTER `[Sprint 1]`

- **US 1.1 (Admin):** Sebagai Admin, saya ingin mendaftarkan data siswa baru ke dalam sistem agar data mereka tersimpan secara resmi.
- **US 1.2 (Admin):** Sebagai Admin, saya ingin mendaftarkan data guru/dosen baru ke dalam sistem agar mereka memiliki akses masuk dan bisa ditugaskan mengajar.
- **US 1.3 (Admin):** Sebagai Admin, saya ingin melihat daftar seluruh siswa dan guru yang terdaftar di sekolah agar saya bisa memantau data secara keseluruhan.
- **US 1.4 (Admin):** Sebagai Admin, saya ingin mengubah (edit) informasi profil siswa atau guru jika terjadi kesalahan penginputan data atau mengganti status guru/siswa ke "aktif" atau "non-aktif".
- **US 1.5 (Admin):** Sebagai Admin, saya ingin mencari data siswa berdasarkan nama atau Nomor Induk Siswa (NIS) agar pencarian data lebih cepat.
- **US 1.6 (Admin):** Sebagai Admin, saya ingin mengunggah data siswa secara massal menggunakan file CSV agar proses pendaftaran puluhan siswa sekaligus berjalan lebih cepat tanpa perlu input satu per satu. `[Baru - Sprint 3 Enhancement]`
- **US 1.7 (Admin):** Sebagai Admin, saya ingin mengubah status aktif/non-aktif siswa atau guru secara instan lewat tombol sakelar (quick toggle) langsung pada baris tabel agar pembaruan status data master lebih praktis tanpa perlu membuka modal edit. `[Baru - Sprint 3 Enhancement]`

### - [x] 2. PENJADWALAN KELAS `[Sprint 2]`

- **US 2.1 (Admin):** Sebagai Admin, saya ingin membuat jadwal kelas baru (memilih mata pelajaran, guru pengampu, hari, jam, dan ruangan) agar kegiatan belajar terstruktur.
- **US 2.2 (Admin):** Sebagai Admin, saya ingin mengubah (edit) jadwal kelas jika terdapat perubahan waktu atau ruangan belajar.
- **US 2.3 (Admin):** Sebagai Admin, saya ingin menghapus jadwal kelas yang batal diselenggarakan atau tidak aktif lagi.
- **US 2.4 (Admin):** Sebagai Admin, saya ingin melihat seluruh daftar jadwal kelas yang aktif di sekolah.
- **US 2.5 (Siswa):** Sebagai Siswa, saya ingin melihat jadwal kelas pribadi yang saya ikuti agar saya tidak melewatkan waktu belajar.
- **US 2.6 (Guru):** Sebagai Guru, saya ingin melihat daftar jadwal mengajar saya agar saya bisa mempersiapkan materi sebelum kelas dimulai.
- **US 2.7 (Admin):** Sebagai Admin, saya ingin sistem secara otomatis mendeteksi bentrok jadwal (guru atau ruangan yang sama di waktu yang sama) saat membuat jadwal baru agar tidak terjadi tumpang tindih alokasi kegiatan belajar. `[Baru - Sprint 3 Enhancement]`
- **US 2.8 (Guru/Siswa):** Sebagai Guru atau Siswa, saya ingin mengunduh jadwal kelas ke dalam format file kalender (.ics) agar saya bisa mengintegrasikan jadwal mengajar atau belajar saya ke dalam Google Calendar pribadi. `[Baru - Sprint 3 Enhancement]`

### - [x] 3. ABSENSI `[Sprint 2]`

- **US 3.1 (Guru):** Sebagai Guru, saya ingin mengisi kehadiran siswa (Hadir/Sakit/Izin/Alfa) pada hari pelaksanaan kelas agar kehadiran mereka terekam di sistem.
- **US 3.2 (Guru):** Sebagai Guru, saya ingin mengubah status kehadiran siswa jika terjadi salah klik atau ada perubahan konfirmasi surat izin di kemudian hari.
- **US 3.3 (Admin):** Sebagai Admin, saya ingin melihat laporan absensi harian sekolah untuk memantau kedisiplinan siswa secara umum.
- **US 3.4 (Guru/Admin):** Sebagai Guru atau Admin, saya ingin melihat visualisasi grafik persentase kehadiran siswa dalam bentuk diagram lingkaran (chart) agar saya bisa mengevaluasi tingkat kedisiplinan kelas secara cepat and interaktif. `[Baru - Sprint 3 Enhancement]`
- **US 3.5 (Guru):** Sebagai Guru, saya ingin sistem mengatur status kehadiran awal seluruh siswa secara otomatis menjadi "Hadir" saat form absensi dibuka agar saya hanya perlu mengubah status siswa yang absen dan menghemat waktu pengerjaan. `[Baru - Sprint 3 Enhancement]`

### - [x] 4. RECORD KESEHATAN SISWA `[Sprint 2]`

- **US 4.1 (Admin/Petugas Medis):** Sebagai Admin, saya ingin mencatat riwayat kesehatan awal siswa (golongan darah, penyakit bawaan, riwayat vaksin, dan alergi) agar sekolah memiliki data medis dasar.
- **US 4.2 (Admin/Petugas Medis):** Sebagai Admin, saya ingin mengubah data medis siswa jika ada pembaruan status kesehatan dari orang tua siswa.
- **US 4.3 (Admin/Guru):** Sebagai Admin atau Guru, saya ingin melihat kontak darurat wali murid secara cepat (quick-view) langsung pada tabel medis siswa yang memiliki riwayat penyakit kronis atau alergi berat agar tindakan pertolongan darurat bisa segera dikoordinasikan. `[Baru - Sprint 3 Enhancement]`
- **US 4.4 (Admin):** Sebagai Admin, saya ingin melakukan pencarian dan penyaringan data medis berdasarkan jenis keluhan penyakit tertentu pada bulan berjalan agar sekolah bisa memantau dan mengantisipasi tren persebaran penyakit di lingkungan sekolah. `[Baru - Sprint 3 Enhancement]`

### - [ ] 5. RECORD KONSELING SISWA `[Sprint 3]`

- **US 5.1 (Guru BK/Konselor):** Sebagai Guru BK, saya ingin membuat catatan hasil sesi konseling siswa agar saya bisa memantau perkembangan mental dan perilaku siswa.
- **US 5.2 (Guru BK/Konselor):** Sebagai Guru BK, saya ingin melihat riwayat seluruh sesi konseling dari seorang siswa tertentu untuk melakukan evaluasi jangka panjang.
- **US 5.3 (Guru BK/Konselor):** Sebagai Guru BK, saya ingin memberikan penandaan status kasus (tagging) seperti Open, In Progress, atau Resolved pada setiap catatan konseling siswa agar penanganan perkembangan perilaku siswa terdokumentasi dengan terstruktur. `[Baru - Sprint 3 Enhancement]`
- **US 5.4 (Guru BK):** Sebagai Guru BK, saya ingin menandai catatan konseling tertentu sebagai data "Rahasia" agar deskripsi sensitif di dalamnya otomatis tersensor bagi akun Admin atau Guru Biasa demi menjaga privasi bimbingan siswa. `[Baru - Sprint 3 Enhancement]`

### - [ ] 6. TRANSKRIP NILAI `[Sprint 3]`

- **US 6.1 (Guru/Admin):** Sebagai Guru, saya ingin menginput nilai siswa (Tugas, UTS, UAS) untuk mata pelajaran yang saya ampu agar nilai mereka terdokumentasi.
- **US 6.2 (Guru/Admin):** Sebagai Guru, saya ingin mengubah nilai siswa jika terjadi kekeliruan dalam proses koreksi atau setelah sesi remedial.
- **US 6.3 (Siswa):** Sebagai Siswa, saya ingin melihat transkrip nilai akumulatif dari seluruh semester yang sudah saya lalui untuk memantau pencapaian akademik saya.
- **US 6.4 (Admin):** Sebagai Admin, saya ingin melihat dan mencetak rangkuman transkrip nilai siswa untuk kebutuhan administratif sekolah.
- **US 6.5 (Siswa/Admin):** Sebagai Siswa atau Admin, saya ingin mengunduh transkrip nilai resmi berbentuk dokumen PDF berwarna dengan tata letak kop surat sekolah agar dokumen tersebut siap dicetak untuk keperluan administratif formal. `[Baru - Sprint 3 Enhancement]`
- **US 6.6 (Guru/Admin):** Sebagai Guru atau Admin, saya ingin sistem secara otomatis mengonversi nilai angka menjadi huruf mutu (A-E) serta mengalkulasi Indeks Prestasi Semester (IPS) berdasarkan bobot SKS agar proses penilaian akhir berjalan akurat secara matematis. `[Baru - Sprint 3 Enhancement]`
