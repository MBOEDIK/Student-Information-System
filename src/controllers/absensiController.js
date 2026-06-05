const db = require('../config/db');

// Controller untuk melihat laporan absensi harian
const getLaporanHarian = async (req, res, next) => {
    try {
        const { tanggal } = req.query;

        // Validasi jika user belum memilih tanggal
        if (!tanggal) {
            return res.status(400).json({
                success: false,
                message: 'Tanggal harus ditentukan.'
            });
        }

        // Query untuk mengambil data absensi berdasarkan tanggal tertentu
        const query = `
            SELECT 
                a.id_absensi,
                s.nama AS nama_siswa,
                s.nis,
                a.status,
                a.keterangan,
                TIME(a.tanggal) AS jam_absen
            FROM absensi a
            JOIN siswa s ON a.id_siswa = s.id_siswa
            WHERE DATE(a.tanggal) = ?
            ORDER BY s.nama ASC
        `;

        const [rows] = await db.query(query, [tanggal]);

        return res.status(200).json({
            success: true,
            message: `Berhasil mengambil laporan absensi untuk tanggal ${tanggal}`,
            data: rows
        });

    } catch (error) {
        // Melempar error ke Global Error Handler kelompokmu di app.js
        next(error);
    }
};

module.exports = {
    getLaporanHarian
};