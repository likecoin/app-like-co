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
    'import/extensions': 'off',
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
  },
}
