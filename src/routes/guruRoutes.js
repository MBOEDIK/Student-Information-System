// src/routes/guruRoutes.js

const express = require('express');
const router = express.Router();
const guruController = require('../controllers/guruController');

router.get('/', guruController.getAllGuru);
router.get('/stats', guruController.getStats);
router.get('/:id', guruController.getGuruById);
router.put('/:id', guruController.updateGuru);

module.exports = router;
