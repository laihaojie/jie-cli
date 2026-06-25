import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    jie: './index.ts',
    bridge: './src/bridge.ts',
    check: './src/check.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  fixedExtension: true,
  // 原生模块与运行时按路径加载的资源包不可 bundle，需运行时从 node_modules 解析
  external: ['node-pty', '@xterm/xterm', '@xterm/addon-fit'],
})
