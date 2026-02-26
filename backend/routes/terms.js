const express = require('express');
const router = express.Router();
const termController = require('../controllers/termController');

// route to get all terms
router.get('/', termController.getAllTerms);

// route to create a new term
router.post('/', termController.createTerm);

module.exports = router;