const router = require('express').Router();
const kesehatanCtrl = require('../controllers/kesehatanController');

router.get('/siswa', kesehatanCtrl.getAllSiswa);
router.get('/', kesehatanCtrl.getAllKesehatan);
router.post('/', kesehatanCtrl.createKesehatan);
router.get('/:studentId/kontak', kesehatanCtrl.getKontakDarurat);
router.get('/:studentId', kesehatanCtrl.getKesehatanBySiswaId);
router.put('/:studentId', kesehatanCtrl.updateKesehatan);

module.exports = router;
