const express = require('express');
const router = express.Router();
const absensiController = require('../controllers/absensiController');

router.get('/', absensiController.getAllAbsensi);
router.post('/', absensiController.createAbsensi);

module.exports = router;