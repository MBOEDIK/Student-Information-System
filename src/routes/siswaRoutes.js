const express = require('express');
const router = express.Router();
const siswaCtrl = require('../controllers/siswaController');

router.get('/',         siswaCtrl.getAllSiswa);
router.get('/stats',    siswaCtrl.getStats);
router.get('/:id',      siswaCtrl.getSiswaById);
router.post('/register', siswaCtrl.createSiswa);
router.put('/:id', siswaCtrl.updateSiswa);

module.exports = router;
