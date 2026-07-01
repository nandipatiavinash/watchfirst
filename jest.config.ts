import type { Config } from 'jest'

const config: Config = {
  preset:              'ts-jest',
  testEnvironment:     'node',
  rootDir:             '.',
  testMatch:           ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
  },
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    '!src/lib/db/client.ts',
  ],
}

export default config
