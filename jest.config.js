export default {
    // Tell Jest we're using TypeScript
    preset: "ts-jest/presets/default-esm",

    // Use Node.js environment (not browser)
    testEnvironment: "node",

    // Run this file BEFORE loading any tests (loads env variables)
    setupFiles: ["<rootDir>/jest.setup.js"],

    // Where to find test files (files ending in .test.ts)
    testMatch: ["**/tests/**/*.test.ts"],

    // Handle ES modules properly
    extensionsToTreatAsEsm: [".ts"],

    // Transform TypeScript files
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                useESM: true,
            },
        ],
    },

    // Map .js imports to .ts files (since your code uses .js extensions)
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};
