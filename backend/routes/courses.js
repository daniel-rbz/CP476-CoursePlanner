const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// route to get all courses
router.get('/', courseController.getAllCourses);

// route to create a new course
router.post('/', courseController.createCourse);

// route to toggle course status
router.patch('/:id/status', courseController.toggleCourseStatus);

// route to update a course's fields
router.put('/:id', courseController.updateCourse);

// route to delete a course
router.delete('/:id', courseController.deleteCourse);

module.exports = router;
