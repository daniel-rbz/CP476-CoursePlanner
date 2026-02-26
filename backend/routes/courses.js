const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// route to get all courses
router.get('/', courseController.getAllCourses);

// route to create a new course
router.post('/', courseController.createCourse);

module.exports = router;
