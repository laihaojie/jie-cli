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
})