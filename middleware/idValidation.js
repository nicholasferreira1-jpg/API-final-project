function validateId(req, res, next) {
    const id = req.params.id;
    if (isNaN(id)) {
        return res.status(400).json({ 
            error: 'Invalid ID format. ID must be a number.' 
        });
    }
    next();
}

module.exports = validateId;