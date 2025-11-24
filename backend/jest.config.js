module.exports = {
  // Tells Jest to use ts-jest to compile TypeScript before running tests
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // Tells Jest to look for files ending with .spec.ts
  testRegex: '.*\\.spec\\.ts$',
  // Defines the folder where test files are located
  rootDir: 'src',
  // Includes standard NestJS file extensions
  moduleFileExtensions: ['js', 'json', 'ts'],

  // Important for code coverage reporting
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',

  // Environment for running the tests (node for backend)
  testEnvironment: 'node',

  // IMPORTANT: Mocks the path resolution for internal modules
  // If you use path aliases in tsconfig, this is needed.
  // We'll rely on the default NestJS structure for now.
};
