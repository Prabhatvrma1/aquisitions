/** @type {import('jest').Config} */
export default {
  // Use the experimental ESM support
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/server.js',
    '!src/config/database.js',
    '!src/config/archjet.js',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  testTimeout: 10000,
};
