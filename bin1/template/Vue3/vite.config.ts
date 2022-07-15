import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  root: process.cwd(),
  css: {
    preprocessorOptions: {
      scss: {
        // 全局变量
        additionalData: '@import "./src/assets/style/global-variables.scss";@import "./src/assets/style/global.scss";',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, './'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8000,
    // proxy: {
    //     '/api': {
    //         target: 'https://api-commonlaw.lingman.tech', // 后端接口的域名
    //         changeOrigin: true,
    //     },
    // },
  },
  build: {
    terserOptions: {
      compress: {
        keep_infinity: true,
        // 删除console
        drop_console: true,
      },
    },
    // 禁用该功能可能会提高大型项目的构建性能
    brotliSize: false,
    rollupOptions: {
      output: {
        // 拆分单独模块
        // manualChunks: {
        //   'element-plus': ['element-plus'],
        // },
      },
    },
  },
})
