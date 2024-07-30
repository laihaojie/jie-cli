const jie = require('@djie/eslint-config').default

module.exports = jie({
  rules: {
    'no-console': 'off',
  },
}, {
  ignores: [
    'bin1/template',
    'bin',
  ],
})
