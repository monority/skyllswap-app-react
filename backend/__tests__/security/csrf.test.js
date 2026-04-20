const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockPrisma = { user: { findUnique: jest.fn() }, csrfToken: { findUnique: jest.fn() } };
jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn(() => mockPrisma) }));
const { app } = require('../../index');

describe('CSRF Protection', () => {
    test('rejects missing CSRF token on PUT', async () => {
        const token = jwt.sign({ sub: 42, email: 'test@test.com' }, process.env.JWT_SECRET || 'change-me-in-env', { expiresIn: '1h' });
        const response = await request(app).put('/api/profile/me').set('Authorization', `Bearer ${token}`).send({ availability: 'soir' });
        expect(response.status).toBe(403);
    });

    test('rejects missing CSRF token on POST', async () => {
        const token = jwt.sign({ sub: 1, email: 'test@test.com' }, process.env.JWT_SECRET || 'change-me-in-env', { expiresIn: '1h' });
        const response = await request(app).post('/api/conversations').set('Authorization', `Bearer ${token}`).send({ recipientId: 2 });
        expect(response.status).toBe(403);
    });

    test('allows GET without CSRF (basic check)', async () => {
        const token = jwt.sign({ sub: 42, email: 'test@test.com' }, process.env.JWT_SECRET || 'change-me-in-env', { expiresIn: '1h' });
        // Cette route nécessite l'authentification mais pas CSRF
        const response = await request(app).get('/').set('Authorization', `Bearer ${token}`);
        expect([200, 401]).toContain(response.status);
    });
});