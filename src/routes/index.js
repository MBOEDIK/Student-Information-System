const router = require('express').Router();

router.use('/auth',  require('./authRoutes'));
router.use('/siswa', require('./siswaRoutes'));
router.use('/guru',  require('./guruRoutes'));

module.exports = router;
