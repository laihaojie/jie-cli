import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  // 生产构建产物放到主仓 dist/web/，由 bridge 静态托管
  build: {
    outDir: path.resolve(__dirname, '../dist/web'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    // 开发时把 /api 和 /ws 代理到本地 bridge
    proxy: {
      '/api': 'http://127.0.0.1:32677',
      '/ws': { target: 'ws://127.0.0.1:32677', ws: true },
    },
  },
})
