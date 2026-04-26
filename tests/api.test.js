const request = require('supertest');
const { db, setupDatabase } = require('../database/setup');
const { seedDatabase } = require('../database/seed');
const server = require('../server');

beforeAll(() => {
    return setupDatabase().then(() => {
        return seedDatabase();
    });
});

afterAll(() => {
    return db.close().catch(() => {
        // It's okay if the connection is already closed
    });
});

// User Tests

describe('User Endpoints', () => {

    test('GET /api/users - should return all users', () => {
        return request(server).get('/api/users').then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('users');
            expect(Array.isArray(res.body.users)).toBe(true);
        });
    });

    test('GET /api/users/:id - should return a single user', () => {
    return request(server).get('/api/users').then((res) => {
        const firstId = res.body.users[0].id;
        return request(server).get(`/api/users/${firstId}`).then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('id');
            });
        });
    });

    test('GET /api/users/:id - should return 404 for non existent user', () => {
        return request(server).get('/api/users/999').then((res) => {
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('GET /api/users/:id - should return 400 for invalid ID', () => {
        return request(server).get('/api/users/abc').then((res) => {
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('POST /api/users - should create a new user', () => {
        return request(server).post('/api/users').send({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
            role: 'user'
        }).then((res) => {
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.name).toBe('Test User');
        });
    });

    test('POST /api/users - should return 400 if fields are missing', () => {
        return request(server).post('/api/users').send({
            email: 'missing@example.com'
        }).then((res) => {
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('PUT /api/users/:id - should update a user', () => {
        return request(server).put('/api/users/1').send({
            name: 'Updated Name'
        }).then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body.user.name).toBe('Updated Name');
        });
    });

    test('DELETE /api/users/:id - should return 404 for non existent user', () => {
        return request(server).delete('/api/users/999').then((res) => {
            expect(res.statusCode).toBe(404);
        });
    });

});

// GOAL TESTS

describe('Goal Endpoints', () => {

    test('GET /api/goals - should return all goals', () => {
        return request(server).get('/api/goals').then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('goals');
            expect(Array.isArray(res.body.goals)).toBe(true);
        });
    });

    test('GET /api/goals/:id - should return a single goal', () => {
        return request(server).get('/api/goals').then((res) => {
        const firstId = res.body.goals[0].id;
        return request(server).get(`/api/goals/${firstId}`).then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('id');
            });
        });
    });

    test('GET /api/goals/:id - should return 404 for non existent goal', () => {
        return request(server).get('/api/goals/999').then((res) => {
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('POST /api/goals - should create a new goal', () => {
        return request(server).post('/api/goals').send({
            title: 'Test Goal',
            description: 'This is a test goal',
            category: 'personal',
            targetDate: '2025-12-31',
            status: 'active',
            userId: 1
        }).then((res) => {
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('goal');
            expect(res.body.goal.title).toBe('Test Goal');
        });
    });

    test('POST /api/goals - should return 400 if fields are missing', () => {
        return request(server).post('/api/goals').send({
            description: 'Missing title and userId'
        }).then((res) => {
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('PUT /api/goals/:id - should update a goal', () => {
        return request(server).put('/api/goals/1').send({
            status: 'completed'
        }).then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body.goal.status).toBe('completed');
        });
    });

    test('DELETE /api/goals/:id - should return 404 for non existent goal', () => {
        return request(server).delete('/api/goals/999').then((res) => {
            expect(res.statusCode).toBe(404);
        });
    });

});

// PROGRESS TESTS

describe('Progress Endpoints', () => {

    test('GET /api/progress - should return all progress steps', () => {
        return request(server).get('/api/progress').then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('progress');
            expect(Array.isArray(res.body.progress)).toBe(true);
        });
    });

    test('GET /api/progress/:id - should return a single progress step', () => {
    return request(server).get('/api/progress').then((res) => {
        const firstId = res.body.progress[0].id;
        return request(server).get(`/api/progress/${firstId}`).then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('id');
            });
        });
    });

    test('GET /api/progress/:id - should return 404 for non existent progress', () => {
        return request(server).get('/api/progress/999').then((res) => {
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error');
        });
    });
    
    test('POST /api/progress - should create a new progress step', () => {
        return request(server).post('/api/progress').send({
            step: 'Test Step',
            notes: 'This is a test step',
            completed: false,
            goalId: 1
        }).then((res) => {
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('progress');
            expect(res.body.progress.step).toBe('Test Step');
        });
    });

    test('POST /api/progress - should return 400 if fields are missing', () => {
        return request(server).post('/api/progress').send({
            notes: 'Missing step and goalId'
        }).then((res) => {
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('PUT /api/progress/:id - should update a progress step', () => {
        return request(server).put('/api/progress/1').send({
            completed: true
        }).then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body.progress.completed).toBe(true);
        });
    });

    test('DELETE /api/progress/:id - should return 404 for non existent progress', () => {
        return request(server).delete('/api/progress/999').then((res) => {
            expect(res.statusCode).toBe(404);
        });
    });

});