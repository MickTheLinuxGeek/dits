
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/client/',
    '/dist/',
  ],
  forceExit: true,
  detectOpenHandles: true,
};
