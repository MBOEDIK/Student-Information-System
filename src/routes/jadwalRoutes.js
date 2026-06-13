// src/routes/jadwalRoutes.js
// Mengatur jalur lalu lintas URL untuk modul penjadwalan kelas

const express = require('express');
const router = express.Router();
const jadwalCtrl = require('../controllers/jadwalController');

router.get('/subjects', jadwalCtrl.getAllSubjects);
router.get('/siswa', jadwalCtrl.getJadwalSiswa);
router.get('/guru', jadwalCtrl.getJadwalGuru);
router.get('/', jadwalCtrl.getAllJadwal);
router.post('/', jadwalCtrl.createJadwal);
router.get('/:id', jadwalCtrl.getJadwalById);
router.put('/:id', jadwalCtrl.updateJadwal);

// US 2.3 - Hapus jadwal
router.delete('/:id', jadwalCtrl.deleteJadwal);

module.exports = router;
