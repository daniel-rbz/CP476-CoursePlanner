const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// route to register a new user
router.post('/signup', userController.signup);

// route to login a user
router.post('/login', userController.login);

module.exports = router;
