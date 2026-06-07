const express = require('express');
const router = express.Router();
const kesehatanCtrl = require('../controllers/kesehatanController');

router.get('/', kesehatanCtrl.getAllKesehatan);
router.get('/:studentId', kesehatanCtrl.getKesehatanBySiswaId);
router.put('/:studentId', kesehatanCtrl.updateKesehatan);

module.exports = router;
