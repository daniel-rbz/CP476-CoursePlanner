const crypto = require('crypto');
const db = require('../db');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const passwordHash = hashPassword(password);
    const [result] = await db.execute(
      'INSERT INTO Users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );

    return res.status(201).json({
      message: 'Signup successful.',
      user: { user_id: result.insertId, email },
    });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists.' });
    }
    return res.status(500).json({ message: 'Failed to sign up user.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const passwordHash = hashPassword(password);
    const [rows] = await db.execute(
      'SELECT user_id, email FROM Users WHERE email = ? AND password_hash = ? LIMIT 1',
      [email, passwordHash]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.status(200).json({
      message: 'Login successful.',
      user: rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to log in user.' });
  }
};
