import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    // 使用 jsdom 模拟浏览器环境
    environment: 'jsdom',
    // 全局 API（describe、it、expect 等无需显式导入）
    globals: true,
    // CSS/SCSS 文件在测试中以空模块形式忽略
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    // 包含的测试文件
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})