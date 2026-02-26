// stub for getting all terms
exports.getAllTerms = (req, res) => {
    res.status(200).json({ message: "Successfully fetched all terms." });
};

// stub for creating a new term
exports.createTerm = (req, res) => {
    res.status(201).json({ message: "Successfully created a new term." });
};