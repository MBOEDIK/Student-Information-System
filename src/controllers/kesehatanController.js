const db = require('../config/db');

// Controller untuk mencatat riwayat kesehatan awal siswa (US 4.1)
const catatRiwayatKesehatan = async (req, res, next) => {
    try {
        const { id_siswa, keluhan, diagnosis, tindakan, catatan } = req.body;

        // Validasi data wajib: ID Siswa, keluhan utama, dan diagnosis tidak boleh kosong
        if (!id_siswa || !keluhan || !diagnosis) {
            return res.status(400).json({
                success: false,
                message: 'ID Siswa, keluhan utama, dan diagnosis wajib diisi!'
            });
        }

        // Query SQL memasukkan data rekam medis baru ke database
        const query = `
            INSERT INTO kesehatan (id_siswa, keluhan, diagnosis, tindakan, catatan, tanggal_periksa)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;

        await db.query(query, [id_siswa, keluhan, diagnosis, tindakan || null, catatan || null]);

        return res.status(201).json({
            success: true,
            message: 'Berhasil mencatat riwayat kesehatan awal siswa ke sistem.'
        });

    } catch (error) {
        // Jika ada error database, dilempar ke penanganan error bawaan kelompok
        next(error);
    }
};

module.exports = {
    catatRiwayatKesehatan
};