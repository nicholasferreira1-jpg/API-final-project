function validateId(req, res, next) {
    const id = req.params.id;

    // Skip validation for known non-numeric route segments
    const nonNumericRoutes = ['category', 'status'];
    if (nonNumericRoutes.includes(id)) {
        return next();
    }

    if (isNaN(id)) {
        return res.status(400).json({ 
            error: 'Invalid ID format. ID must be a number.' 
        });
    }
    next();
}

module.exports = validateId;