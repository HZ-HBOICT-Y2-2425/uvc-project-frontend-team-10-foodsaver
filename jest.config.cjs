const path = require('path');

module.exports = {
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
    '^.+\\.m?[tj]sx?$': 'babel-jest',
  },
  extensionsToTreatAsEsm: ['.svelte'],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'svelte', 'json'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/jest-setup.js'],
  transformIgnorePatterns: ['node_modules/(?!@sveltejs)/'],
  moduleNameMapper: {
    '^\\$app/(.*)$': path.join(__dirname, 'node_modules/@sveltejs/kit/src/runtime/app/$1'),
    '^__sveltekit/paths$': path.join(__dirname, 'node_modules/@sveltejs/kit/src/runtime/paths.js'),
  },
};

