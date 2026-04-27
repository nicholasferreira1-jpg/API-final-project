const express = require('express');
const router = express.Router();
const { Goal, User, Progress } = require('../database/setup');
const { requireOwnership } = require('../middleware/role');


// GET /api/goals/category/:category - Get goals by category
router.get('/category/:category', async (req, res) => {
    try {
        const validCategories = ['fitness', 'education', 'personal', 'career', 'finance', 'other'];
        if (!validCategories.includes(req.params.category)) {
            return res.status(400).json({ 
                error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
            });
        }

        const where = req.user.role === 'admin' 
            ? { category: req.params.category }
            : { category: req.params.category, userId: req.user.id };

        const goals = await Goal.findAll({
            where,
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Progress }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            message: `Goals in category "${req.params.category}" retrieved successfully`,
            goals: goals,
            total: goals.length
        });
    } catch (error) {
        console.error('Error fetching goals by category:', error);
        res.status(500).json({ error: 'Failed to fetch goals by category' });
    }
});

// GET /api/goals/status/:status - Get goals by status
router.get('/status/:status', async (req, res) => {
    try {
        const validStatuses = ['active', 'completed', 'abandoned'];
        if (!validStatuses.includes(req.params.status)) {
            return res.status(400).json({ 
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }

        const where = req.user.role === 'admin'
            ? { status: req.params.status }
            : { status: req.params.status, userId: req.user.id };

        const goals = await Goal.findAll({
            where,
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Progress }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            message: `Goals with status "${req.params.status}" retrieved successfully`,
            goals: goals,
            total: goals.length
        });
    } catch (error) {
        console.error('Error fetching goals by status:', error);
        res.status(500).json({ error: 'Failed to fetch goals by status' });
    }
});

// GET /api/goals - Get all goals (admin sees all, user sees own)
router.get('/', async (req, res) => {
    try {
        const where = req.user.role === 'admin' ? {} : { userId: req.user.id };

        const goals = await Goal.findAll({
            where,
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

// GET /api/goals/:id - Get single goal (admin or owner)
router.get('/:id', requireOwnership(Goal), async (req, res) => {
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
router.post('/', async (req, res) => {
    try {
        const { title, description, category, targetDate, status } = req.body;

        if (!title || !category) {
            return res.status(400).json({ error: 'Title and category are required' });
        }

        const newGoal = await Goal.create({
            title,
            description,
            category,
            targetDate,
            status: status || 'active',
            userId: req.user.id
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

// PUT /api/goals/:id - Update goal (admin or owner)
router.put('/:id', requireOwnership(Goal), async (req, res) => {
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

// DELETE /api/goals/:id - Delete goal (admin or owner)
router.delete('/:id', requireOwnership(Goal), async (req, res) => {
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

module.exports = router;