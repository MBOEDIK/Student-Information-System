const express = require('express');
const router = express.Router();
const konselingController = require('../controllers/konselingController');

router.post('/api/konseling', konselingController.createKonseling);
router.get('/api/konseling', konselingController.getRiwayatKonseling);

module.exports = router;