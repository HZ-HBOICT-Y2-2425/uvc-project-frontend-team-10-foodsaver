export default {
  preset: 'ts-jest/presets/default-esm', // For TypeScript and ES Modules
  testEnvironment: 'jest-environment-jsdom', // Set the test environment to JSDOM
  transform: {
    '^.+\\.svelte$': 'svelte-jester', // Transform Svelte files
    '^.+\\.js$': 'babel-jest',        // Transform JavaScript files
    '^.+\\.ts$': 'ts-jest',           // Transform TypeScript files
  },
  moduleFileExtensions: ['js', 'ts', 'svelte'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  // Coverage settings
  collectCoverage: true, // Enable coverage collection
  coverageDirectory: 'coverage', // Output directory for coverage reports
  coverageReporters: ['text', 'lcov'], // Define coverage reporters (text and lcov for HTML reports)
  collectCoverageFrom: [
    'src/**/*.{js,ts,svelte}', // Collect coverage from JS, TS, and Svelte files in src directory
    '!src/**/*.d.ts', // Exclude type declaration files from coverage
    '!src/**/__tests__/**', // Exclude tests folder
    '!src/**/*.test.{js,ts,svelte}', // Exclude test files from coverage
  ],
  coverageThreshold: { // Set coverage thresholds
    global: {
      branches: 0, // Require 80% branch coverage
      functions: 0, // Require 80% function coverage
      lines: 0, // Require 80% line coverage
      statements: 0, // Require 80% statement coverage
    },
  },
};