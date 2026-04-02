const db = require('../db');

exports.getAllCourses = async (req, res) => {
    try {
        const termId = Number(req.query.term_id);

        if (!termId) {
            return res.status(400).json({ message: 'term_id is required.' });
        }

        const [rows] = await db.execute(
            'SELECT course_id, term_id, course_code, course_title, credits, status FROM Courses WHERE term_id = ? ORDER BY course_id',
            [termId]
        );

        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch courses.' });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { term_id, course_code, course_title, credits, status } = req.body;

        if (!term_id || !course_code || !course_title || !credits) {
            return res.status(400).json({
                message: 'term_id, course_code, course_title, and credits are required.',
            });
        }

        const [result] = await db.execute(
            'INSERT INTO Courses (term_id, course_code, course_title, credits, status) VALUES (?, ?, ?, ?, ?)',
            [term_id, course_code, course_title, credits, status || 'Planned']
        );

        return res.status(201).json({
            course_id: result.insertId,
            term_id,
            course_code,
            course_title,
            credits,
            status: status || 'Planned',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create course.' });
    }
};
