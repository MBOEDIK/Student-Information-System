const router = require('express').Router();
const absensiCtrl = require('../controllers/absensiController');

router.post('/', absensiCtrl.createAbsensi);

module.exports = router;
