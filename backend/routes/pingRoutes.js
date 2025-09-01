const express = require('express');
const router = express.Router();
const pingController = require('../controllers/pingController');

// Endpoint de monitoring
router.get('/health', pingController.health);

module.exports = router;
