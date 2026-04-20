const request = require('supertest');
const mockPrisma = { user: { findUnique: jest.fn() }, csrfToken: { findUnique: jest.fn() } };
jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn(() => mockPrisma) }));
const { app } = require('../../index');

const ALLOWED_ORIGIN = 'http://localhost:5173';

describe('CORS Configuration', () => {
    test('allows requests from localhost:5173', async () => {
        const response = await request(app).get('/api/health').set('Origin', ALLOWED_ORIGIN);
        expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    });

    test('allows credentials with allowed origin', async () => {
        const response = await request(app).get('/api/health').set('Origin', ALLOWED_ORIGIN);
        expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    test('handles OPTIONS preflight for allowed origin', async () => {
        const response = await request(app).options('/api/health').set('Origin', ALLOWED_ORIGIN).set('Access-Control-Request-Method', 'GET');
        expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    });
});
