const express = require('express');
const router = express.Router();
const guruCtrl = require('../controllers/guruController');

router.get('/',       guruCtrl.getAllGuru);
router.get('/stats',  guruCtrl.getStats);

module.exports = router;
