// src/routes/authRoutes.js
// Mengatur jalur lalu lintas URL untuk modul autentikasi pengguna

const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

// Mapping endpoint API ke fungsi pengendali di authController
router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout);
router.get('/check', authCtrl.checkSession);

module.exports = router;
