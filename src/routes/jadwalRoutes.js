// src/routes/jadwalRoutes.js
// Mengatur jalur lalu lintas URL untuk modul penjadwalan kelas

const express = require('express');
const router = express.Router();
const jadwalCtrl = require('../controllers/jadwalController');

router.get('/subjects', jadwalCtrl.getAllSubjects);
router.get('/',          jadwalCtrl.getAllJadwal);
router.post('/',         jadwalCtrl.createJadwal);

module.exports = router;
