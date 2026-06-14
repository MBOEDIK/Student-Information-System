'use strict';

const express = require('express');
const router = express.Router();
const nilaiCtrl = require('../controllers/nilaiController');

router.get('/transkrip', nilaiCtrl.getTranskripSiswa);
router.get('/transkrip-admin', nilaiCtrl.getTranskripAdmin);
module.exports = router;
