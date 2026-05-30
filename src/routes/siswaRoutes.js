const express = require('express');
const router = express.Router();

const siswaController = require('../controllers/siswaController');

router.get('/search', siswaController.searchSiswa);

module.exports = router;