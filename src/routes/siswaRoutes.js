const express = require('express');
const router = express.Router();
const siswaController = require('../controllers/siswaController');

// GET semua siswa
router.get('/', siswaController.getAllSiswa);

// GET siswa berdasarkan ID
router.get('/:id', siswaController.getSiswaById);

// PUT update data siswa
router.put('/:id', siswaController.updateSiswa);

module.exports = router;