const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// get all courses for the logged-in user (across all their terms)
exports.getAllCourses = (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ message: 'Not logged in.' });
    }

    db.all(
        `SELECT c.course_id, c.term_id, c.course_code, c.course_title, c.credits, c.status,
                t.semester, t.academic_year
         FROM Courses c
         JOIN Terms t ON c.term_id = t.term_id
         WHERE t.user_id = ?
         ORDER BY t.academic_year ASC, t.semester ASC`,
        [user_id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Failed to fetch courses.' });

            const courses = rows.map(row => ({
                course_id: row.course_id,
                term_id: row.term_id,
                courseCode: row.course_code,
                courseTitle: row.course_title,
                credits: row.credits,
                status: row.status,
                termName: `${row.semester} ${row.academic_year}`
            }));
            res.status(200).json(courses);
        }
    );
};

// create and save a course under a term that belongs to the logged-in user
exports.createCourse = (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ message: 'Not logged in.' });
    }

    const { term_id, courseCode, courseTitle, creditWeight, status } = req.body;

    if (!term_id || !courseCode || !courseTitle || !creditWeight || !status) {
        return res.status(400).json({ message: 'Missing required course fields.' });
    }

    const credits = parseFloat(creditWeight);
    if (isNaN(credits) || (credits !== 0.25 && credits !== 0.50)) {
        return res.status(400).json({ message: 'Credit weight must be 0.25 or 0.50.' });
    }

    // verify the term belongs to the logged-in user
    db.get(
        'SELECT term_id FROM Terms WHERE term_id = ? AND user_id = ?',
        [term_id, user_id],
        (err, term) => {
            if (err) return res.status(500).json({ message: 'Failed to verify term.' });
            if (!term) return res.status(403).json({ message: 'Term not found or access denied.' });

            db.run(
                'INSERT INTO Courses (term_id, course_code, course_title, credits, status) VALUES (?, ?, ?, ?, ?)',
                [term_id, courseCode.toUpperCase(), courseTitle, credits, status],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Failed to save course.' });
                    res.status(201).json({
                        course_id: this.lastID,
                        term_id,
                        courseCode: courseCode.toUpperCase(),
                        courseTitle,
                        credits,
                        status
                    });
                }
            );
        }
    );
};

// cycle a course status: Planned -> In Progress -> Completed -> Planned
exports.toggleCourseStatus = (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ message: 'Not logged in.' });
    }

    const course_id = Number(req.params.id);

    db.get(
        `SELECT c.course_id, c.status FROM Courses c
         JOIN Terms t ON c.term_id = t.term_id
         WHERE c.course_id = ? AND t.user_id = ?`,
        [course_id, user_id],
        (err, course) => {
            if (err) return res.status(500).json({ message: 'Failed to fetch course.' });
            if (!course) return res.status(404).json({ message: 'Course not found.' });

            const statusCycle = ['Planned', 'In Progress', 'Completed'];
            const currentIndex = statusCycle.indexOf(course.status);
            const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

            db.run(
                'UPDATE Courses SET status = ? WHERE course_id = ?',
                [nextStatus, course_id],
                function (err) {
                    if (err) return res.status(500).json({ message: 'Failed to update status.' });
                    res.status(200).json({ course_id, status: nextStatus });
                }
            );
        }
    );
};

// update all editable fields of a course
exports.updateCourse = (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ message: 'Not logged in.' });
    }

    const course_id = Number(req.params.id);
    const { courseCode, courseTitle, creditWeight, status } = req.body;

    if (!courseCode || !courseTitle || !creditWeight || !status) {
        return res.status(400).json({ message: 'Missing required course fields.' });
    }

    const credits = parseFloat(creditWeight);
    if (isNaN(credits) || (credits !== 0.25 && credits !== 0.50)) {
        return res.status(400).json({ message: 'Credit weight must be 0.25 or 0.50.' });
    }

    db.run(
        `UPDATE Courses SET course_code = ?, course_title = ?, credits = ?, status = ?
         WHERE course_id = ?
         AND term_id IN (SELECT term_id FROM Terms WHERE user_id = ?)`,
        [courseCode.toUpperCase(), courseTitle, credits, status, course_id, user_id],
        function(err) {
            if (err) return res.status(500).json({ message: 'Failed to update course.' });
            if (this.changes === 0) return res.status(404).json({ message: 'Course not found.' });
            res.status(200).json({
                course_id,
                courseCode: courseCode.toUpperCase(),
                courseTitle,
                credits,
                status
            });
        }
    );
};

// delete a course by id (only if it belongs to the logged-in user)
exports.deleteCourse = (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ message: 'Not logged in.' });
    }

    const course_id = Number(req.params.id);

    db.run(
        `DELETE FROM Courses WHERE course_id = ?
         AND term_id IN (SELECT term_id FROM Terms WHERE user_id = ?)`,
        [course_id, user_id],
        function (err) {
            if (err) return res.status(500).json({ message: 'Failed to delete course.' });
            if (this.changes === 0) return res.status(404).json({ message: 'Course not found.' });
            res.status(200).json({ message: 'Course deleted successfully.' });
        }
    );
};
