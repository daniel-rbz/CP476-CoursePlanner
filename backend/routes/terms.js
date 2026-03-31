const express = require('express');
const router = express.Router();
const termController = require('../controllers/termController');

// route to get all terms
router.get('/', termController.getAllTerms);

// route to create a new term
router.post('/', termController.createTerm);

// route to delete a term by name
router.delete('/:termName', termController.deleteTerm);

module.exports = router;
