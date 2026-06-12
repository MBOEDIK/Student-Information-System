const router = require('express').Router();
const kesehatanCtrl = require('../controllers/kesehatanController');

router.post('/', kesehatanCtrl.createKesehatan);

module.exports = router;
