module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.test.ts'],
    setupFiles: ['./__tests__/setup.js'],
    clearMocks: true,
    restoreMocks: true,
    collectCoverage: false,
    collectCoverageFrom: ['index.ts'],
    coverageReporters: ['text', 'lcov'],
    coverageThreshold: {
        global: {
            statements: 30,
            branches: 20,
            functions: 20,
            lines: 30,
        },
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: false }],
    },
};
