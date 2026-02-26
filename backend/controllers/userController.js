// stub for user signup
exports.signup = (req, res) => {
  res.status(201).json({ message: "Successfully signed up user." });
};

// stub for user login
exports.login = (req, res) => {
    res.status(200).json({ message: "Successfully logged in user." });
};
