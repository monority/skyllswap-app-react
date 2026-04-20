const request = require('supertest');
const mockPrisma = { user: { findUnique: jest.fn() }, csrfToken: { findUnique: jest.fn() } };
jest.mock('@prisma/client', () => ({ PrismaClient: jest.fn(() => mockPrisma) }));
const { app } = require('../../index');

describe('Security Headers (Helmet)', () => {
    let response;
    beforeAll(async () => { response = await request(app).get('/api/health'); });

    test('HSTS header is present', () => { expect(response.headers['strict-transport-security']).toBeDefined(); });
    test('HSTS maxAge is 1 year', () => { expect(response.headers['strict-transport-security']).toContain('max-age=31536000'); });
    test('CSP header is present', () => { expect(response.headers['content-security-policy']).toBeDefined(); });
    test('X-Frame-Options is present', () => { expect(response.headers['x-frame-options']).toBeDefined(); });
    test('X-Content-Type-Options is nosniff', () => { expect(response.headers['x-content-type-options']).toBe('nosniff'); });
    test('Referrer-Policy header is present', () => { expect(response.headers['referrer-policy']).toBeDefined(); });
});
