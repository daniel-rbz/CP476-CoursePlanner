const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// get all saved terms for the logged-in user
exports.getAllTerms = (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ message: 'Not logged in.' });
    }

    db.all(
        'SELECT term_id, semester, academic_year FROM Terms WHERE user_id = ? ORDER BY academic_year ASC, semester ASC',
        [user_id],
        (err, rows) => {
            if (err) return res.status(500).json({ message: 'Failed to fetch terms.' });

            const terms = rows.map(row => ({
                term_id: row.term_id,
                semester: row.semester,
                year: String(row.academic_year),
                termName: `${row.semester} ${row.academic_year}`
            }));
            res.status(200).json(terms);
        }
    );
};

// create and save a term for the logged-in user
exports.createTerm = (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ message: 'Not logged in.' });
    }

    const { semester, year } = req.body;

    if (!semester || !year) {
        return res.status(400).json({ message: 'Missing required term fields.' });
    }

    const academic_year = parseInt(year, 10);
    if (isNaN(academic_year)) {
        return res.status(400).json({ message: 'Year must be a number.' });
    }

    db.run(
        'INSERT INTO Terms (user_id, semester, academic_year) VALUES (?, ?, ?)',
        [user_id, semester, academic_year],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ message: 'Term already exists.' });
                }
                return res.status(500).json({ message: 'Failed to save term.' });
            }
            res.status(201).json({
                term_id: this.lastID,
                semester,
                year: String(academic_year),
                termName: `${semester} ${academic_year}`
            });
        }
    );
};

// delete a saved term by term_id (only if it belongs to the logged-in user)
exports.deleteTerm = (req, res) => {
    const user_id = req.session.user_id;
    if (!user_id) {
        return res.status(401).json({ message: 'Not logged in.' });
    }

    const { term_id } = req.params;

    db.run(
        'DELETE FROM Terms WHERE term_id = ? AND user_id = ?',
        [term_id, user_id],
        function (err) {
            if (err) return res.status(500).json({ message: 'Failed to delete term.' });
            if (this.changes === 0) return res.status(404).json({ message: 'Term not found.' });
            res.status(200).json({ message: 'Term deleted successfully.' });
        }
    );
};
