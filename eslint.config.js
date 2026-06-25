const jie = require('@djie/eslint-config').default

module.exports = jie({
  rules: {
    'no-console': 'off',
    // 该规则强制 pnpm-workspace.yaml 设 trustPolicy，但 trustPolicy:no-downgrade 会触发
    // pnpm 11 供应链检查（chokidar/tinyexec 被标记可疑）导致 install 失败。关闭强制。
    'pnpm/yaml-enforce-settings': 'off',
  },
}, {
  ignores: [
    'bin1/template',
    'bin',
    'dist',
    '.trellis',
    '.claude',
  ],
})
