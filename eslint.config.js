import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginJest from 'eslint-plugin-jest';
import babelEslintParser from '@babel/eslint-parser';
import eslintPluginSonarjs from 'eslint-plugin-sonarjs';

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
      sonarjs: eslintPluginSonarjs,
    },
    rules: {
      // Regular ESLint and SonarJS rules
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-redundant-boolean': 'warn',
      'sonarjs/no-inverted-boolean-check': 'warn',

      // Cyclomatic complexity rule: Warn if complexity exceeds 10
      'complexity': ['warn', { 'max': 1 }],

      // React-specific rules (optional)
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

      // Example code smell rules
      'no-unused-vars': 'warn', // Warn on variables declared but not used
    },
  },
  {
    files: ['src/tests/**/*.[jt]s?(x)'], // Apply Jest environment to files in src/tests folder
    plugins: {
      jest: eslintPluginJest, // Use Jest plugin
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
];
