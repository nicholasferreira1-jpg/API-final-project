const express = require('express');
const router = express.Router();
const { Progress, Goal } = require('../database/setup');

// Helper to check if user owns the progress step
async function checkProgressOwnership(req, res) {
    const progress = await Progress.findByPk(req.params.id, {
        include: [{ model: Goal }]
    });

    if (!progress) {
        res.status(404).json({ error: 'Progress step not found' });
        return null;
    }

    const isOwner = progress.Goal.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
        res.status(403).json({ 
            error: 'Access denied. You can only access your own progress.' 
        });
        return null;
    }

    return progress;
}

// GET /api/progress - Get all progress (admin sees all, user sees own)
router.get('/', async (req, res) => {
    try {
        const include = [{ model: Goal, attributes: ['id', 'title', 'category', 'userId'] }];

        const allProgress = await Progress.findAll({
            include,
            order: [['createdAt', 'DESC']]
        });

        const progress = req.user.role === 'admin'
            ? allProgress
            : allProgress.filter(p => p.Goal.userId === req.user.id);

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

// GET /api/progress/:id - Get single progress step (admin or owner)
router.get('/:id', async (req, res) => {
    try {
        const progress = await checkProgressOwnership(req, res);
        if (!progress) return;
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

        // Make sure user owns the goal
        if (goal.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Access denied. You can only add progress to your own goals.' 
            });
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

// PUT /api/progress/:id - Update progress step (admin or owner)
router.put('/:id', async (req, res) => {
    try {
        const progress = await checkProgressOwnership(req, res);
        if (!progress) return;

        const { step, notes, completed, completedAt } = req.body;

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

// DELETE /api/progress/:id - Delete progress step (admin or owner)
router.delete('/:id', async (req, res) => {
    try {
        const progress = await checkProgressOwnership(req, res);
        if (!progress) return;

        await progress.destroy();
        res.json({ message: 'Progress step deleted successfully' });
    } catch (error) {
        console.error('Error deleting progress:', error);
        res.status(500).json({ error: 'Failed to delete progress step' });
    }
});

module.exports = router;