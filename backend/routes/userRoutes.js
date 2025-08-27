const authenticateToken = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes publiques
router.post('/register', userController.register);
router.post('/login', userController.login);

// Toutes les autres routes nécessitent un token
router.get('/', authenticateToken, userController.getUsers);
router.post('/', authenticateToken, userController.addUser);
router.get('/me', authenticateToken, userController.getMe);

module.exports = router;