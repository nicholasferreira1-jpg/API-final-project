const express = require('express');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Goal Tracker API is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
router.get('/', (req, res) => {
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

module.exports = router;