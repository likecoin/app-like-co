module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    'airbnb-base',
    '@nuxtjs/eslint-config-typescript',
    'plugin:nuxt/recommended',
    'prettier'
  ],
  rules: {
    "import/extensions": "off",
  },
}
