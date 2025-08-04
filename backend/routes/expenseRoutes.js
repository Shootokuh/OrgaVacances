const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.get('/trip/:tripId', expenseController.getExpensesByTrip);
router.post('/', expenseController.addExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
