const express = require('express');
const router = express.Router();
const multer = require('multer');
const siswaCtrl = require('../controllers/siswaController');

const upload = multer({ dest: 'uploads/', limits: { fileSize: 2 * 1024 * 1024 } });

router.get('/', siswaCtrl.getAllSiswa);
router.get('/search', siswaCtrl.searchSiswa);
router.get('/stats', siswaCtrl.getStats);
router.get('/:id', siswaCtrl.getSiswaById);
router.post('/register', siswaCtrl.createSiswa);
router.post('/import-csv', upload.single('file'), siswaCtrl.importCsvSiswa);
router.put('/:id', siswaCtrl.updateSiswa);

module.exports = router;
