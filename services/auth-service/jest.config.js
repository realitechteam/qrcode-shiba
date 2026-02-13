module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', {
            isolatedModules: true,
        }],
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: './coverage',
    moduleNameMapper: {
        '^@prisma/client$': '<rootDir>/../../packages/database/node_modules/@prisma/client',
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    testEnvironment: 'node',
};
