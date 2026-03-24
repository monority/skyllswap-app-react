module.exports = {
    testEnvironment: 'node',
    clearMocks: true,
    restoreMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ['index.js'],
    coverageReporters: ['text', 'lcov'],
    coverageThreshold: {
        global: {
            statements: 60,
            branches: 45,
            functions: 60,
            lines: 60,
        },
    },
};
