const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const mockPrisma = { user: { findUnique: jest.fn(), create: jest.fn() }, profile: { findUnique: jest.fn(), update: jest.fn() }, csrfToken: { findUnique: jest.fn() } };
jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn(() => mockPrisma) }));
const { app } = require('../../index');

describe('Authentication Security', () => {
    test('rejects malformed JWT token', async () => {
        const response = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not.a.valid.jwt');
        expect(response.status).toBe(401);
    });

    test('rejects expired JWT token', async () => {
        const expiredToken = jwt.sign({ sub: 42, email: 'test@test.com' }, process.env.JWT_SECRET || 'change-me-in-env', { expiresIn: '-1h' });
        const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expiredToken}`);
        expect(response.status).toBe(401);
    });

    test('returns 401 for protected route without token', async () => {
        const response = await request(app).get('/api/auth/me');
        expect(response.status).toBe(401);
    });

    test('rejects weak password (too short)', async () => {
        const response = await request(app).post('/api/auth/register').send({ name: 'Test User', email: 'test@test.com', password: '1234567' });
        expect(response.status).toBe(400);
    });

    test('rejects invalid email format', async () => {
        const response = await request(app).post('/api/auth/register').send({ name: 'Test', email: 'not-an-email', password: 'password123' });
        expect(response.status).toBe(400);
    });
});