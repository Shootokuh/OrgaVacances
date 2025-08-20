const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

// Liste des participants d'un voyage
router.get('/:tripId', participantController.getParticipants);
// Ajouter un participant
router.post('/:tripId', participantController.addParticipant);
// Supprimer un participant
router.delete('/one/:participantId', participantController.deleteParticipant);

module.exports = router;
