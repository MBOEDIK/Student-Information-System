const express = require('express');
const router = express.Router();
const absensiController = require('../controllers/absensiController');

// Endpoint: GET /api/absensi/laporan
router.get('/laporan', absensiController.getLaporanHarian);

module.exports = router;