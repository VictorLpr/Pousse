/**
 * Jest configuration (ADR-0007). The tests run as native ES modules:
 * BetterAuth only ships ESM. Node strips the types
 * (`test/support/strip-types-transformer.mjs`).
 *
 * @type {import('jest').Config}
 */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: { '^.+\\.ts$': '<rootDir>/test/support/strip-types-transformer.mjs' },
  // `.js` import specifiers point to the `.ts` sources; `#/x.js` imports to
  // `src/`, like the `development` condition in `package.json`.
  moduleNameMapper: {
    '^#/(.*)\\.js$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  globalSetup: '<rootDir>/test/support/global-setup.ts',
  globalTeardown: '<rootDir>/test/support/global-teardown.ts',
};
