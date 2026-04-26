const express = require('express');
const router = express.Router();
const {User} = require('../database/setup');
const { requireAdmin } = require('../middleware/role');

// GET /api/users - Get all users
router.get('/', requireAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json({
            message: 'Users retrieved successfully',
            users: users,
            total: users.length
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/users/:id - Get single user
router.get('/:id', async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const isOwner = req.user.id === parseInt(req.params.id);

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ 
                error: 'Access denied. You can only view your own account.' 
            });
        }
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});


// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        const isOwner = req.user.id === parseInt(req.params.id);

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ 
                error: 'Access denied. You can only update your own account.' 
            });
        }

        const { name, email, role } = req.body;

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
         // Only admins can change roles
        const updatedRole = isAdmin ? (role || user.role) : user.role;

        await user.update({
            name: name || user.name,
            email: email || user.email,
            role: updatedRole
        });

        res.json({
            message: 'User updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;