const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./database.db');

// handle user signup
exports.signup = (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Hash error' });

    db.run(
      'INSERT INTO Users (email, password_hash) VALUES (?, ?)',
      [email, hash],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Signup failed' });
        }
        req.session.user_id = this.lastID;
        req.session.email = email;
        res.status(201).json({ user_id: this.lastID, email });
      }
    );
  });
};

// handle user login
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    db.get(
      'SELECT user_id, password_hash FROM Users WHERE email = ?',
      [email],
      (err, user) => {
        if (err) return res.status(500).json({ error: 'Login failed' });
        if (!user) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        bcrypt.compare(password, user.password_hash, (err, match) => {
          if (err) return res.status(500).json({ error: 'Login failed' });
          if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
          }
          req.session.user_id = user.user_id;
          req.session.email = email;
          res.status(200).json({ user_id: user.user_id, email });
        });
      }
    );
};

// handle user logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.status(200).json({ message: 'Logged out' });
  });
};

// get current user from session
exports.getSession = (req, res) => {
  if (req.session.user_id) {
    res.status(200).json({ user_id: req.session.user_id, email: req.session.email });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
};
