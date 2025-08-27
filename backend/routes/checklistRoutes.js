const express = require('express');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const checklistController = require('../controllers/checklistController');

router.get('/trip/:tripId', authenticateToken, checklistController.getChecklist);
router.post('/trip/:tripId', authenticateToken, checklistController.addChecklistItem);
router.put('/:itemId', authenticateToken, checklistController.updateChecklistItem);
router.delete('/:itemId', authenticateToken, checklistController.deleteChecklistItem);

module.exports = router;
