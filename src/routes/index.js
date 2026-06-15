const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/siswa', require('./siswaRoutes'));
router.use('/guru', require('./guruRoutes'));
router.use('/jadwal', require('./jadwalRoutes'));
router.use('/absensi', require('./absensiRoutes'));
router.use('/kesehatan', require('./kesehatanRoutes'));
router.use('/konseling', require('./konselingRoutes'));

module.exports = router;
