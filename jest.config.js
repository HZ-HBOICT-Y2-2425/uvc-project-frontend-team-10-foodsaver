module.exports = {
    preset: "ts-jest",
    transform: {
      "^.+\\.svelte$": "jest-transform-svelte",
      "^.+\\.tsx?$": "ts-jest",
    },
    transformIgnorePatterns: [
      "node_modules/(?!(svelte)/)"
    ],
    setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
    moduleFileExtensions: ["js", "ts", "svelte"],
    testEnvironment: "jsdom",
  };
  