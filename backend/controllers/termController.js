const terms = [];

// get all saved terms
exports.getAllTerms = (req, res) => {
    res.status(200).json(terms);
};

// create and save a term
exports.createTerm = (req, res) => {
    const { semester, year } = req.body;

    if (!semester || !year) {
        return res.status(400).json({ message: "Missing required term fields." });
    }

    const termName = `${semester} ${year}`;
    const duplicateTerm = terms.find((term) => term.termName === termName);
    if (duplicateTerm) {
        return res.status(409).json({ message: "Term already exists." });
    }

    const newTerm = {
        id: terms.length + 1,
        semester,
        year: String(year),
        termName
    };

    terms.push(newTerm);
    return res.status(201).json(newTerm);
};

// delete a saved term by name
exports.deleteTerm = (req, res) => {
    const { termName } = req.params;
    const termIndex = terms.findIndex((term) => term.termName === termName);

    if (termIndex === -1) {
        return res.status(404).json({ message: "Term not found." });
    }

    terms.splice(termIndex, 1);
    return res.status(200).json({ message: "Term deleted successfully." });
};
