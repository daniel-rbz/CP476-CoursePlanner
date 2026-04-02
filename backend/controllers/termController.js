const db = require('../db');

exports.getAllTerms = async (req, res) => {
    try {
        const userId = Number(req.query.user_id);

        if (!userId) {
            return res.status(400).json({ message: 'user_id is required.' });
        }

        const [rows] = await db.execute(
            'SELECT term_id, user_id, semester, academic_year FROM Terms WHERE user_id = ? ORDER BY academic_year, term_id',
            [userId]
        );

        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch terms.' });
    }
};

exports.createTerm = async (req, res) => {
    try {
        const { user_id, semester, academic_year } = req.body;

        if (!user_id || !semester || !academic_year) {
            return res.status(400).json({ message: 'user_id, semester, and academic_year are required.' });
        }

        const [result] = await db.execute(
            'INSERT INTO Terms (user_id, semester, academic_year) VALUES (?, ?, ?)',
            [user_id, semester, academic_year]
        );

        return res.status(201).json({
            term_id: result.insertId,
            user_id,
            semester,
            academic_year,
        });
    } catch (error) {
        if (error && error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Term already exists for this user.' });
        }
        return res.status(500).json({ message: 'Failed to create term.' });
    }
};