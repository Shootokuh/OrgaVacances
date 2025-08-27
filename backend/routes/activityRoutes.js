const express = require('express');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const activityController = require('../controllers/activityController');

router.get('/trip/:tripId', authenticateToken, activityController.getActivitiesByTrip);
router.post('/', authenticateToken, activityController.addActivity);
router.delete("/:id", authenticateToken, activityController.deleteActivity);
router.put("/:id", authenticateToken, activityController.updateActivity);

module.exports = router;
