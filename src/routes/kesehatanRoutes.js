const router = require('express').Router();
const { createKesehatan } = require('../controllers/kesehatanController');

router.post('/', createKesehatan);

module.exports = router;