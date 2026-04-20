module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/security/**/*.test.js'],
    setupFiles: ['./__tests__/setup.js'],
    clearMocks: true,
    restoreMocks: true,
    collectCoverage: false,
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: false }],
    },
};
