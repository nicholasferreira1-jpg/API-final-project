const request = require('supertest');
const { db, User, Goal, Progress, setupDatabase } = require('../database/setup');
const { seedDatabase } = require('../database/seed');
const server = require('../server');

let adminToken;
let userToken;

async function getTokens() {
    await setupDatabase();
    // Clear existing data before seeding
    await Progress.destroy({ where: {} });
    await Goal.destroy({ where: {} });
    await User.destroy({ where: {} });


    await seedDatabase();

    const adminRes = await request(server).post('/api/login').send({
        email: 'admin@example.com',
        password: 'password123'
    });
    adminToken = adminRes.body.token;

    const userRes = await request(server).post('/api/login').send({
        email: 'nicholas@example.com',
        password: 'password123'
    });
    userToken = userRes.body.token;

    return { adminToken, userToken };
}

module.exports = { db, server, getTokens };