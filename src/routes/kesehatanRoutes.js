const express = require('express');
const router = express.Router();
const kesehatanController = require('../controllers/kesehatanController');

// Jalur Alamat Endpoint: POST /api/kesehatan/catat
router.post('/catat', kesehatanController.catatRiwayatKesehatan);

module.exports = router;