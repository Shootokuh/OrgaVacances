const express = require('express');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const participantController = require('../controllers/participantController');

router.get('/:tripId', authenticateToken, participantController.getParticipants);
router.post('/:tripId', authenticateToken, participantController.addParticipant);
router.delete('/one/:participantId', authenticateToken, participantController.deleteParticipant);

module.exports = router;
