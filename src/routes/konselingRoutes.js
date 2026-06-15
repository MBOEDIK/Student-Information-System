const router = require('express').Router();
const konselingCtrl = require('../controllers/konselingController');

router.get('/siswa', konselingCtrl.getAllSiswa);
router.post('/', konselingCtrl.createKonseling);
router.get('/', konselingCtrl.getAllKonseling);
router.get('/:id', konselingCtrl.getKonselingById);

module.exports = router;
