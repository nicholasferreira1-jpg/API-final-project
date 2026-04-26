const express = require('express');
const router = express.Router();
const { Progress, Goal } = require('../database/setup');

// GET /api/progress - Get all progress steps
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

module.exports = router;