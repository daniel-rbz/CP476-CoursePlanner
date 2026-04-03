const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// route to register a new user
router.post('/signup', userController.signup);

// route to login a user
router.post('/login', userController.login);

// route to logout
router.post('/logout', userController.logout);

// route to get current session
router.get('/session', userController.getSession);

module.exports = router;
