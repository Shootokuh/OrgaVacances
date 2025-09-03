const express = require('express');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const tripController = require('../controllers/tripController');

router.get('/', authenticateToken, tripController.getTrips);
router.get('/:id', authenticateToken, tripController.getTripById);
router.post('/', authenticateToken, tripController.addTrip);
router.put('/:id', authenticateToken, tripController.updateTrip);
router.delete('/:id', authenticateToken, tripController.deleteTrip);

module.exports = router;