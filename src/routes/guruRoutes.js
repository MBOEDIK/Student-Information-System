const express = require('express');
const router = express.Router();
const guruController = require('../controllers/guruController');

// GET semua guru
router.get('/', guruController.getAllGuru);

// GET guru berdasarkan ID
router.get('/:id', guruController.getGuruById);

// PUT update data guru
router.put('/:id', guruController.updateGuru);

module.exports = router;