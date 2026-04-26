const express = require('express');
const {setupDatabase} = require('./database/setup')
const logger = require('./middleware/logger');
const idValidation = require('./middleware/idValidation');

const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/users');
const goalRoutes = require('./routes/goals');
const progressRoutes = require('./routes/progress');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(express.json());
app.use(logger);

// Validate ID middleware

app.use('/api/:resource/:id', validateId);

//Routes
app.use('/', indexRoutes);
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/progress', progressRoutes);

module.exports = app;

// Start server
setupDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
});
