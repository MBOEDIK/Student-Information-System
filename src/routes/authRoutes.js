const express    = require('express');
const router     = express.Router();
const authCtrl   = require('../controllers/authController');

router.post('/login',  authCtrl.login);
router.get('/check',   authCtrl.checkSession);
router.post('/logout', authCtrl.logout);

module.exports = router;
