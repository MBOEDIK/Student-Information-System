const express = require('express');
const router = express.Router();
const siswaCtrl = require('../controllers/siswaController');

router.get('/',         siswaCtrl.getAllSiswa);
router.get('/stats',    siswaCtrl.getStats);
router.post('/register', siswaCtrl.createSiswa);

module.exports = router;
