const router = require('express').Router();
const absensiCtrl = require('../controllers/absensiController');

router.get('/jadwal-guru', absensiCtrl.getJadwalGuru);
router.get('/siswa/:scheduleId', absensiCtrl.getSiswaByJadwal);
router.post('/', absensiCtrl.createAbsensi);
router.get('/laporan', absensiCtrl.getLaporanHarian);
router.get('/laporan/rekap', absensiCtrl.getRekapHarian);

module.exports = router;
