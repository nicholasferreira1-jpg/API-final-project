const request = require('supertest');
const { db, server, getTokens } = require('./setup');

beforeAll(() => {
    return getTokens();
});

afterAll(() => {
    return db.close().catch(() => {});
});

describe('Authentication Endpoints', () => {

    test('POST /api/register - should register a new user', () => {
        return request(server).post('/api/register').send({
            name: 'New User',
            email: 'newuser@example.com',
            password: 'password123'
        }).then((res) => {
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('user');
        });
    });

    test('POST /api/register - should return 400 if fields are missing', () => {
        return request(server).post('/api/register').send({
            email: 'missing@example.com'
        }).then((res) => {
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('POST /api/register - should return 400 if email already exists', () => {
        return request(server).post('/api/register').send({
            name: 'Duplicate',
            email: 'admin@example.com',
            password: 'password123'
        }).then((res) => {
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('POST /api/login - should login and return a token', () => {
        return request(server).post('/api/login').send({
            email: 'admin@example.com',
            password: 'password123'
        }).then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
    });

    test('POST /api/login - should return 401 for wrong password', () => {
        return request(server).post('/api/login').send({
            email: 'admin@example.com',
            password: 'wrongpassword'
        }).then((res) => {
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('POST /api/login - should return 401 for non existent email', () => {
        return request(server).post('/api/login').send({
            email: 'nobody@example.com',
            password: 'password123'
        }).then((res) => {
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error');
        });
    });

    test('POST /api/logout - should logout successfully', () => {
        return request(server).post('/api/logout').then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message');
        });
    });

});