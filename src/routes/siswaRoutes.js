const express = require('express');
const router = express.Router();
const siswaCtrl = require('../controllers/siswaController');

router.post('/register', siswaCtrl.createSiswa);

module.exports = router;
