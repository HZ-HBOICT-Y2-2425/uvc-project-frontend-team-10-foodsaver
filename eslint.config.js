import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginJest from 'eslint-plugin-jest'; // Import the Jest plugin
import babelEslintParser from '@babel/eslint-parser';

export default [
  {
    ignores: ['dist', 'node_modules'], // Ignore specific folders if needed
  },
  {
    files: ['**/*.js', '**/*.jsx'], // Apply to JS and JSX files
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: babelEslintParser, // Use Babel to parse modern JS and JSX
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
        requireConfigFile: false, // Required for @babel/eslint-parser
      },
    },
    plugins: {
      react: eslintPluginReact, // Use React plugin
      'react-hooks': eslintPluginReactHooks,
    },
    rules: {
      // Enable some recommended rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
      'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies

      // Customize rules as per team standards
      'no-console': 'warn', // Allow console.log but with warning
      'quotes': ['error', 'single'], // Enforce single quotes
      'semi': ['error', 'always'], // Enforce semicolons
      'indent': ['error', 2], // Enforce 2-space indentation
      'max-len': ['warn', { code: 80 }], // Warn if a line exceeds 80 characters
    },
  },
  {
    files: ['src/tests/**/*.[jt]s?(x)'], // Apply Jest environment to files in src/tests folder
    plugins: {
      jest: eslintPluginJest, // Use Jest plugin
    },
    rules: {
      'jest/no-disabled-tests': 'warn', // Example Jest rule
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
];
