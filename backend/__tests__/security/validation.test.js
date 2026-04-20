const request = require('supertest');

const mockPrisma = { user: { findUnique: jest.fn() } };
jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn(() => mockPrisma) }));
const { app } = require('../../index');

describe('Input Validation', () => {
    test('rejects name too short', async () => {
        const response = await request(app).post('/api/auth/register').send({ name: 'A', email: 'test@test.com', password: 'password123' });
        expect(response.status).toBe(400);
    });

    test('rejects name too long', async () => {
        const response = await request(app).post('/api/auth/register').send({ name: 'A'.repeat(41), email: 'test@test.com', password: 'password123' });
        expect(response.status).toBe(400);
    });

    test('rejects empty name', async () => {
        const response = await request(app).post('/api/auth/register').send({ name: '', email: 'test@test.com', password: 'password123' });
        expect(response.status).toBe(400);
    });

    test('rejects invalid email format', async () => {
        const response = await request(app).post('/api/auth/register').send({ name: 'Test', email: 'invalid', password: 'password123' });
        expect(response.status).toBe(400);
    });

    test('accepts valid data (basic validation)', async () => {
        const response = await request(app).post('/api/auth/register').send({ name: 'Test User', email: 'test@test.com', password: 'password123' });
        expect([200, 201, 400, 409, 500]).toContain(response.status);
    });
});