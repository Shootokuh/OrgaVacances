const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checklistController');

// Récupérer la checklist d'un voyage
router.get('/trip/:tripId', checklistController.getChecklist);
// Ajouter un item à la checklist
router.post('/trip/:tripId', checklistController.addChecklistItem);
// Modifier le statut coché/décoché d'un item
router.put('/:itemId', checklistController.updateChecklistItem);
// Supprimer un item
router.delete('/:itemId', checklistController.deleteChecklistItem);

module.exports = router;
