// eslint.config.js
export default {
    extends: [
      'eslint:recommended', // Use the recommended ESLint rules
      'plugin:svelte/recommended' // Add Svelte-specific linting if using Svelte
    ],
    parserOptions: {
      ecmaVersion: 'latest', // Use the latest JavaScript version
      sourceType: 'module' // Allow ES6 modules
    },
    env: {
      browser: true, // If you are targeting a browser environment
      node: true // If you are using Node.js
    },
  };
  