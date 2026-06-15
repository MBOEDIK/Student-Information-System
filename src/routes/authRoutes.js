const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout);
router.get('/check', authCtrl.checkSession);

module.exports = router;
