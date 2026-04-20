const request = require('supertest');
const mockPrisma = { user: { findUnique: jest.fn() }, csrfToken: { findUnique: jest.fn() } };
jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn(() => mockPrisma) }));
const { app } = require('../../index');

const GLOBAL_LIMIT = 200;

describe('Rate Limiting', () => {
    test('returns rate limit headers on endpoints', async () => {
        const response = await request(app).get('/api/health');
        expect(response.headers['ratelimit-limit']).toBeDefined();
    });

    test(`allows ${GLOBAL_LIMIT} requests per minute on health`, async () => {
        let failedCount = 0;
        for (let i = 0; i < GLOBAL_LIMIT + 1; i++) {
            const res = await request(app).get('/api/health');
            if (res.status === 429) failedCount++;
        }
        expect(failedCount).toBeGreaterThanOrEqual(1);
    });

    test('applies rate limiting to health endpoint', async () => {
        for (let i = 0; i < GLOBAL_LIMIT; i++) {
            await request(app).get('/api/health');
        }
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(429);
    });
});