module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@analyzers/(.*)$': '<rootDir>/src/analyzers/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^obsidian$': '<rootDir>/tests/__mocks__/obsidian.ts'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};