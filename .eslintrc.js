module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    'prettier',
  ],
  rules: {
    "@typescript-eslint/no-shadow": ["error"],
    'array-bracket-newline': [
      'warn',
      { minItems: 2 },
    ],
    'array-element-newline': [
      'warn',
      'always',
    ],
    'comma-dangle': [
      'warn',
      'always-multiline',
    ],
    'import/extensions': 'off',
    "no-shadow": "off",
  },
}
