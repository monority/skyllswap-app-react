module.exports = {
    testEnvironment: 'node',
    clearMocks: true,
    restoreMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ['index.js'],
    coverageReporters: ['text', 'lcov'],
    coverageThreshold: {
        global: {
            statements: 35,
            branches: 20,
            functions: 35,
            lines: 35,
        },
    },
};
