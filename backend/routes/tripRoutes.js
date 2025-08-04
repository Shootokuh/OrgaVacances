const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');


router.get('/', tripController.getTrips);
router.post('/', tripController.addTrip);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

module.exports = router;