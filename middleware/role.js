// Check if user is an admin
function requireAdmin(req, res, next) {
     // Check if user is authenticated first
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Access denied. Admin role required.' 
        });
    }
    next();
}

// Check if user owns the resource or is an admin
function requireOwnership(model) {
    return async (req, res, next) => {
        try {
            const resource = await model.findByPk(req.params.id);

            if (!resource) {
                return res.status(404).json({ error: 'Resource not found' });
            }

            const isOwner = resource.userId === req.user.id;
            const isAdmin = req.user.role === 'admin';

            if (!isOwner && !isAdmin) {
                return res.status(403).json({ 
                    error: 'Access denied. You can only access your own data.' 
                });
            }

            next();
        } catch (error) {
            console.error('Ownership check failed:', error);
            res.status(500).json({ error: 'Authorization check failed' });
        }
    };
}

module.exports = { requireAdmin, requireOwnership };
