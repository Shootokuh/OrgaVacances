const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.post('/', userController.addUser);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', userController.getMe);

module.exports = router;