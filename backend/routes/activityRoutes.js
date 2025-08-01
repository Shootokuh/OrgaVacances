const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// ✅ Assure-toi que ces handlers existent bien dans le controller
router.get('/trip/:tripId', activityController.getActivitiesByTrip);
router.post('/', activityController.addActivity);

module.exports = router;
