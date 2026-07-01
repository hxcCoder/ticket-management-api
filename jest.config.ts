import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/?(*.)+(spec|test).ts'
    ],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],

    // Añade esto para resolver el mock de @prisma/client
    moduleNameMapper: {
        '^@prisma/client$': '<rootDir>/__mocks__/@prisma/client.ts'
    },

    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/config/**',
    '!src/types/**',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/**/__tests__/**/*',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
],
};

export default config;