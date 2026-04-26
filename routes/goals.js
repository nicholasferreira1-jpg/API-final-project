const express = require('express');
const router = express.Router();
const { Goal, User, Progress } = require('../database/setup');

// GET /api/goals - Get all goals
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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