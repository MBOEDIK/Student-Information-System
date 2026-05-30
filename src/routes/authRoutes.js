// src/routes/authRoutes.js

const express    = require('express');
const router     = express.Router();
const authCtrl   = require('../controllers/authController');

router.post('/login',  authCtrl.login);
router.get('/check',   authCtrl.checkSession);

module.exports = router;
