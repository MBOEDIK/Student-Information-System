const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const kesehatanController = require('../controllers/kesehatanController');

router.get('/', kesehatanController.getAllKesehatan);
router.post('/', kesehatanController.createKesehatan);

module.exports = router;
=======
const kesehatanCtrl = require('../controllers/kesehatanController');

router.get('/', kesehatanCtrl.getAllKesehatan);
router.get('/:studentId', kesehatanCtrl.getKesehatanBySiswaId);
router.put('/:studentId', kesehatanCtrl.updateKesehatan);

module.exports = router;
>>>>>>> 1376324722d6ec5babc15c7b853629f79ddd04b5
