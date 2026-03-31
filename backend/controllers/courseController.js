const courses = [];

// get all saved courses
exports.getAllCourses = (req, res) => {
    res.status(200).json(courses);
};

// create and save a course
exports.createCourse = (req, res) => {
    const { termName, courseCode, courseTitle, creditWeight, status } = req.body;

    if (!termName || !courseCode || !courseTitle || !creditWeight || !status) {
        return res.status(400).json({ message: "Missing required course fields." });
    }

    const newCourse = {
        id: courses.length + 1,
        termName,
        courseCode,
        courseTitle,
        creditWeight,
        status
    };

    courses.push(newCourse);
    return res.status(201).json(newCourse);
};

// toggle a course between Planned and Completed
exports.toggleCourseStatus = (req, res) => {
    const courseId = Number(req.params.id);
    const course = courses.find((item) => item.id === courseId);

    if (!course) {
        return res.status(404).json({ message: "Course not found." });
    }

    course.status = course.status === "Completed" ? "Planned" : "Completed";
    return res.status(200).json(course);
};

// delete a course by id
exports.deleteCourse = (req, res) => {
    const courseId = Number(req.params.id);
    const courseIndex = courses.findIndex((item) => item.id === courseId);

    if (courseIndex === -1) {
        return res.status(404).json({ message: "Course not found." });
    }

    courses.splice(courseIndex, 1);
    return res.status(200).json({ message: "Course deleted successfully." });
};
