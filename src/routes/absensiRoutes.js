const router = require('express').Router();
const { createAbsensi } = require('../controllers/absensiController');

router.post('/', createAbsensi);

module.exports = router;