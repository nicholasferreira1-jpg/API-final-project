const request = require('supertest');
const { db, server, getTokens } = require('./setup');

let userToken;
let adminToken;

beforeAll(() => {
    return getTokens().then((tokens) => {
        adminToken = tokens.adminToken;
        userToken = tokens.userToken;
    });
});

afterAll(() => {
    return db.close().catch(() => {});
});

describe('Goal Endpoints', () => {

    test('GET /api/goals - should return goals for logged in user', () => {
        return request(server).get('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('goals');
            expect(Array.isArray(res.body.goals)).toBe(true);
        });
    });

    test('GET /api/goals/category/:category - should return goals by category', () => {
        return request(server).get('/api/goals/category/fitness')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('goals');
        });
    });

    test('GET /api/goals/category/:category - should return 400 for invalid category', () => {
        return request(server).get('/api/goals/category/invalid')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('GET /api/goals/status/:status - should return goals by status', () => {
        return request(server).get('/api/goals/status/active')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('goals');
        });
    });

    test('GET /api/goals/status/:status - should return 400 for invalid status', () => {
        return request(server).get('/api/goals/status/invalid')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('GET /api/goals/:id - should return a single goal', () => {
        return request(server).get('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            const firstId = res.body.goals[0].id;
            return request(server).get(`/api/goals/${firstId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .then((res) => {
                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('id');
            });
        });
    });

    test('GET /api/goals/:id - should return 404 for non existent goal', () => {
        return request(server).get('/api/goals/999')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(404);
        });
    });

    test('POST /api/goals - should create a new goal', () => {
        return request(server).post('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
            title: 'Test Goal',
            description: 'This is a test goal',
            category: 'personal',
            targetDate: '2026-12-31',
            status: 'active'
        }).then((res) => {
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('goal');
            expect(res.body.goal.title).toBe('Test Goal');
        });
    });

    test('POST /api/goals - should return 400 if fields are missing', () => {
        return request(server).post('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ description: 'Missing title' })
        .then((res) => {
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('PUT /api/goals/:id - should update a goal', () => {
        return request(server).get('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            const firstId = res.body.goals[0].id;
            return request(server).put(`/api/goals/${firstId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ status: 'active' })
            .then((res) => {
                expect(res.statusCode).toBe(200);
            });
        });
    });

    test('DELETE /api/goals/:id - should return 404 for non existent goal', () => {
        return request(server).delete('/api/goals/999')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(404);
        });
    });

});