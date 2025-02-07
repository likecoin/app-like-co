module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js',
    "axios": "axios/dist/node/axios.cjs", // https://stackoverflow.com/a/74297004
    '^arweavekit$': '<rootDir>/test/mocks/arweavekit.js',
    '^arweavekit/(.*)$': '<rootDir>/test/mocks/arweavekit.js',
  },
  moduleFileExtensions: [
    'ts',
    'js',
    'vue',
    'json',
  ],
  transform: {
    "^.+\\.ts$": "ts-jest",
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': '@vue/vue2-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/components/**/*.vue',
    '<rootDir>/pages/**/*.vue',
  ],
  testEnvironment: 'jsdom',
}
