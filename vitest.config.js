import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,           // Use globals (like `describe`, `it`)
    environment: 'jsdom',    // Simulate a browser-like environment
    include: ['src/**/*.{test,spec}.{js,ts}'], // Test file patterns
  },
})
