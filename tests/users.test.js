const request = require('supertest');
const { db, server, getTokens } = require('./setup');

let adminToken;
let userToken;

beforeAll(() => {
    return getTokens().then((tokens) => {
        adminToken = tokens.adminToken;
        userToken = tokens.userToken;
    });
});

afterAll(() => {
    return db.close().catch(() => {});
});

describe('Authorization Middleware', () => {

    test('Should return 401 when no token is provided', () => {
        return request(server).get('/api/users').then((res) => {
            expect(res.statusCode).toBe(401);
        });
    });

    test('Should return 401 when invalid token is provided', () => {
        return request(server).get('/api/users')
        .set('Authorization', 'Bearer invalidtoken123')
        .then((res) => {
            expect(res.statusCode).toBe(401);
        });
    });

    test('Should return 403 when regular user accesses admin only route', () => {
        return request(server).get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(403);
        });
    });

    test('Should return 200 when admin accesses admin only route', () => {
        return request(server).get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
    });

});

describe('User Endpoints', () => {

    test('GET /api/users - admin should return all users', () => {
        return request(server).get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('users');
            expect(Array.isArray(res.body.users)).toBe(true);
        });
    });

    test('GET /api/users/:id - admin should return a single user', () => {
        return request(server).get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .then((res) => {
            const firstId = res.body.users[0].id;
            return request(server).get(`/api/users/${firstId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .then((res) => {
                expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('id');
            });
        });
    });

    test('GET /api/users/:id - should return 404 for non existent user', () => {
        return request(server).get('/api/users/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(404);
        });
    });

    test('GET /api/users/:id - should return 400 for invalid ID', () => {
        return request(server).get('/api/users/abc')
        .set('Authorization', `Bearer ${adminToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(400);
        });
    });

    test('PUT /api/users/:id - admin should update a user', () => {
        return request(server).get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .then((res) => {
            const firstId = res.body.users[0].id;
            return request(server).put(`/api/users/${firstId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Updated Name' })
            .then((res) => {
                expect(res.statusCode).toBe(200);
                expect(res.body.user.name).toBe('Updated Name');
            });
        });
    });

    test('DELETE /api/users/:id - should return 404 for non existent user', () => {
        return request(server).delete('/api/users/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .then((res) => {
            expect(res.statusCode).toBe(404);
        });
    });

});