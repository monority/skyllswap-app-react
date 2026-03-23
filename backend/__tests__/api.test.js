const request = require('supertest');

const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
    },
    profile: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
};

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrisma),
}));

const { app, validateProfileUpdate, countOverlap } = require('../index');

describe('API basic behavior', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/health returns ok status', async () => {
        const response = await request(app).get('/api/health');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            status: 'ok',
            service: 'skillswap-local-api',
        });
    });

    test('GET /api/auth/me without token returns 401', async () => {
        const response = await request(app).get('/api/auth/me');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    test('GET /api/profile/me without token returns 401', async () => {
        const response = await request(app).get('/api/profile/me');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });

    test('POST /api/auth/register rejects weak password', async () => {
        const payload = {
            name: 'Alice',
            email: 'alice@example.com',
            password: '123',
        };

        const response = await request(app).post('/api/auth/register').send(payload);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('at least 6 chars');
    });

    test('GET /api/matches/me without token returns 401', async () => {
        const response = await request(app).get('/api/matches/me');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized');
    });
});

describe('Pure helpers', () => {
    test('validateProfileUpdate accepts valid data', () => {
        const result = validateProfileUpdate({
            city: 'Lyon',
            availability: 'soir',
            offers: ['React', 'Node.js'],
            needs: ['Design UI'],
        });

        expect(result.error).toBeUndefined();
        expect(result.next).toEqual({
            city: 'Lyon',
            availability: 'soir',
            offers: ['React', 'Node.js'],
            needs: ['Design UI'],
        });
    });

    test('validateProfileUpdate rejects invalid availability', () => {
        const result = validateProfileUpdate({ availability: 'nuit' });

        expect(result.error).toContain('availability must be one of');
    });

    test('countOverlap is case-insensitive and unique-based', () => {
        const total = countOverlap(['React', 'react', 'Node'], ['REACT', 'Vue']);

        expect(total).toBe(1);
    });
});
