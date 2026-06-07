const express = require('express');
const router = express.Router();
const kesehatanController = require('../controllers/kesehatanController');

router.get('/', kesehatanController.getAllKesehatan);
router.post('/', kesehatanController.createKesehatan);

module.exports = router;