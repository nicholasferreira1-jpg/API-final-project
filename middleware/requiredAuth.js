const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Access denied. No token provided.' 
        });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired. Please log in again.' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token. Please log in again.' 
            });
        } else {
            return res.status(401).json({ 
                error: 'Token verification failed.' 
            });
        }
    }
}

module.exports = requireAuth;