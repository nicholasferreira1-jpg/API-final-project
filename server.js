const express = require('express');
const { db, User, Goal, Progress, setupDatabase } = require('./database/setup');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Goal Tracker API is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Goal Tracker API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            users: 'GET /api/users',
            goals: 'GET /api/goals',
            progress: 'GET /api/progress'
        }
    });
});

// AUTHENTICATION ROUTES


// GET /api/users - Get all users
app.get('/api/users', async (req, res) => {
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
app.get('/api/users/:id', async (req, res) => {
    try {
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

// POST /api/users - Create new user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const newUser = await User.create({ name, email, password, role });
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.update({
            name: name || user.name,
            email: email || user.email,
            role: role || user.role
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

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', async (req, res) => {
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

// GOAL ROUTES

// GET /api/goals - Get all goals
app.get('/api/goals', async (req, res) => {
    try {
        const goals = await Goal.findAll({
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Progress }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({
            message: 'Goals retrieved successfully',
            goals: goals,
            total: goals.length
        });
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Failed to fetch goals' });
    }
});

// GET /api/goals/:id - Get single goal
app.get('/api/goals/:id', async (req, res) => {
    try {
        const goal = await Goal.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Progress }
            ]
        });
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.json(goal);
    } catch (error) {
        console.error('Error fetching goal:', error);
        res.status(500).json({ error: 'Failed to fetch goal' });
    }
});

// POST /api/goals - Create new goal
app.post('/api/goals', async (req, res) => {
    try {
        const { title, description, category, targetDate, status, userId } = req.body;

        if (!title || !category || !userId) {
            return res.status(400).json({ error: 'Title, category, and userId are required' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newGoal = await Goal.create({
            title,
            description,
            category,
            targetDate,
            status: status || 'active',
            userId
        });

        res.status(201).json({
            message: 'Goal created successfully',
            goal: newGoal
        });
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ error: 'Failed to create goal' });
    }
});

// PUT /api/goals/:id - Update goal
app.put('/api/goals/:id', async (req, res) => {
    try {
        const { title, description, category, targetDate, status } = req.body;

        const goal = await Goal.findByPk(req.params.id);
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        await goal.update({
            title: title || goal.title,
            description: description !== undefined ? description : goal.description,
            category: category || goal.category,
            targetDate: targetDate || goal.targetDate,
            status: status || goal.status
        });

        res.json({
            message: 'Goal updated successfully',
            goal: goal
        });
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ error: 'Failed to update goal' });
    }
});

// DELETE /api/goals/:id - Delete goal
app.delete('/api/goals/:id', async (req, res) => {
    try {
        const goal = await Goal.findByPk(req.params.id);
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        await goal.destroy();
        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ error: 'Failed to delete goal' });
    }
});

// PROGRESS ROUTES

// GET /api/progress - Get all progress steps
app.get('/api/progress', async (req, res) => {
    try {
        const progress = await Progress.findAll({
            include: [{ model: Goal, attributes: ['id', 'title', 'category'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({
            message: 'Progress retrieved successfully',
            progress: progress,
            total: progress.length
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

// GET /api/progress/:id - Get single progress step
app.get('/api/progress/:id', async (req, res) => {
    try {
        const progress = await Progress.findByPk(req.params.id, {
            include: [{ model: Goal, attributes: ['id', 'title', 'category'] }]
        });
        if (!progress) {
            return res.status(404).json({ error: 'Progress step not found' });
        }
        res.json(progress);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress step' });
    }
});

// POST /api/progress - Create new progress step
app.post('/api/progress', async (req, res) => {
    try {
        const { step, notes, completed, completedAt, goalId } = req.body;

        if (!step || !goalId) {
            return res.status(400).json({ error: 'Step and goalId are required' });
        }

        const goal = await Goal.findByPk(goalId);
        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        const newProgress = await Progress.create({
            step,
            notes,
            completed: completed || false,
            completedAt: completed ? completedAt || new Date() : null,
            goalId
        });

        res.status(201).json({
            message: 'Progress step created successfully',
            progress: newProgress
        });
    } catch (error) {
        console.error('Error creating progress:', error);
        res.status(500).json({ error: 'Failed to create progress step' });
    }
});

// PUT /api/progress/:id - Update progress step
app.put('/api/progress/:id', async (req, res) => {
    try {
        const { step, notes, completed, completedAt } = req.body;

        const progress = await Progress.findByPk(req.params.id);
        if (!progress) {
            return res.status(404).json({ error: 'Progress step not found' });
        }

        await progress.update({
            step: step || progress.step,
            notes: notes !== undefined ? notes : progress.notes,
            completed: completed !== undefined ? completed : progress.completed,
            completedAt: completed ? completedAt || new Date() : progress.completedAt
        });

        res.json({
            message: 'Progress step updated successfully',
            progress: progress
        });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ error: 'Failed to update progress step' });
    }
});

// DELETE /api/progress/:id - Delete progress step
app.delete('/api/progress/:id', async (req, res) => {
    try {
        const progress = await Progress.findByPk(req.params.id);
        if (!progress) {
            return res.status(404).json({ error: 'Progress step not found' });
        }

        await progress.destroy();
        res.json({ message: 'Progress step deleted successfully' });
    } catch (error) {
        console.error('Error deleting progress:', error);
        res.status(500).json({ error: 'Failed to delete progress step' });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `${req.method} ${req.path} is not a valid endpoint`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
setupDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
});