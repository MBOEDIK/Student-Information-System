const router = require('express').Router();
const absensiCtrl = require('../controllers/absensiController');

router.post('/', absensiCtrl.createAbsensi);
router.get('/laporan', absensiCtrl.getLaporanHarian);
router.get('/laporan/rekap', absensiCtrl.getRekapHarian);

module.exports = router;
