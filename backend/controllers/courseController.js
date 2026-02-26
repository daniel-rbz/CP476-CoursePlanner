// stub for getting all courses
exports.getAllCourses = (req, res) => {
    res.status(200).json({ message: "Successfully fetched all courses." });
};

// stub for creating a new course
exports.createCourse = (req, res) => {
    res.status(201).json({ message: "Successfully created a new course." });
};
