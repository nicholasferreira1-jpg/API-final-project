const request = require('supertest');
const { db, server, getTokens } = require('./setup');

let userToken;

beforeAll(() => {
    return getTokens().then((tokens) => {
        userToken = tokens.userToken;
    });
});

afterAll(() => {
    return db.close().catch(() => {});
});

describe('Progress Endpoints', () => {

    test('GET /api/progress - should return all progress steps', () => {
        return request(server).get('/api/progress')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('progress');
            expect(Array.isArray(res.body.progress)).toBe(true);
        });
    });

    test('GET /api/progress/:id - should return a single progress step', () => {
        return request(server).get('/api/progress')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            const firstId = res.body.progress[0].id;
            return request(server).get(`/api/progress/${firstId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .then((res) => {
                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('id');
            });
        });
    });

    test('GET /api/progress/:id - should return 404 for non existent progress', () => {
        return request(server).get('/api/progress/999')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(404);
        });
    });

    test('POST /api/progress - should create a new progress step', () => {
        return request(server).get('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            const firstGoalId = res.body.goals[0].id;
            return request(server).post('/api/progress')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                step: 'Test Step',
                notes: 'This is a test step',
                completed: false,
                goalId: firstGoalId
            }).then((res) => {
                expect(res.statusCode).toBe(201);
                expect(res.body).toHaveProperty('progress');
                expect(res.body.progress.step).toBe('Test Step');
            });
        });
    });

    test('POST /api/progress - should return 400 if fields are missing', () => {
        return request(server).post('/api/progress')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ notes: 'Missing step and goalId' })
        .then((res) => {
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('PUT /api/progress/:id - should update a progress step', () => {
        return request(server).get('/api/progress')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            const firstId = res.body.progress[0].id;
            return request(server).put(`/api/progress/${firstId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ completed: true })
            .then((res) => {
                expect(res.statusCode).toBe(200);
                expect(res.body.progress.completed).toBe(true);
            });
        });
    });

    test('DELETE /api/progress/:id - should return 404 for non existent progress', () => {
        return request(server).delete('/api/progress/999')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(404);
        });
    });

});