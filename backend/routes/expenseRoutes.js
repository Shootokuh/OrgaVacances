const express = require('express');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.get('/trip/:tripId', authenticateToken, expenseController.getExpensesByTrip);
router.post('/', authenticateToken, expenseController.addExpense);
router.put('/:id', authenticateToken, expenseController.updateExpense);
router.delete('/:id', authenticateToken, expenseController.deleteExpense);

module.exports = router;
