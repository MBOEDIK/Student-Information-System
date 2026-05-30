const db = require('../config/db');

exports.searchSiswa = (req, res) => {
    const keyword = req.query.keyword;

    if (!keyword || keyword.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Kata kunci pencarian tidak boleh kosong."
        });
    }

    const sqlQuery = `SELECT * FROM students WHERE nama LIKE ? OR nis LIKE ?`;

    const searchValues = [`%${keyword}%`, `%${keyword}%`];

    db.query(sqlQuery, searchValues, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan pada server saat mencari data.",
                error: err.message
            });
        }

        return res.status(200).json({
            success: true,
            message: results.length > 0 ? "Data siswa berhasil ditemukan." : "Data siswa tidak ditemukan.",
            data: results
        });
    });
};