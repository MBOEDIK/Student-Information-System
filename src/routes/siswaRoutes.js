const express = require('express');
const router = express.Router();
const siswaCtrl = require('../controllers/siswaController');

router.get('/',         siswaCtrl.getAllSiswa);
router.get('/search',   siswaCtrl.searchSiswa);
router.get('/stats',    siswaCtrl.getStats);
router.get('/:id',      siswaCtrl.getSiswaById);
router.post('/register', siswaCtrl.createSiswa);
router.put('/:id',      siswaCtrl.updateSiswa);

router.patch('/:id/status', siswaCtrl.toggleStatusSiswa);
module.exports = router;
