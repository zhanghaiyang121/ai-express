<script setup lang="ts">
import { useAppStore } from '@/stores'

const appStore = useAppStore()
appStore.setPageTitle('关于')
</script>

<template>
  <div class="about-page">
    <h1>关于 Express4</h1>
    <div class="content">
      <p>这是一个基于 Vite + Vue3 + TypeScript 的前端项目架构。</p>
      <div class="features">
        <h2>项目特性</h2>
        <ul>
          <li>✅ Vue 3 Composition API (Script Setup 语法)</li>
          <li>✅ TypeScript 类型安全</li>
          <li>✅ Pinia 状态管理（Setup Stores 风格）</li>
          <li>✅ Axios 请求封装（拦截器、错误处理）</li>
          <li>✅ Mitt 事件总线（组件通信）</li>
          <li>✅ Sass/SCSS 模块化样式</li>
          <li>✅ ESLint 代码规范检查</li>
          <li>✅ 路由懒加载 & 导航守卫</li>
        </ul>
      </div>
      <p class="back-link">
        <router-link to="/">← 返回首页</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.about-page {
  max-width: 700px;
  margin: 0 auto;
  padding: 40px $content-padding;

  h1 {
    font-size: 28px;
    color: $primary-color;
    margin-bottom: 24px;
    text-align: center;
  }

  .content {
    p {
      font-size: 15px;
      line-height: 1.8;
      color: $text-regular;
      margin-bottom: 20px;
    }

    .features {
      background: $bg-color-white;
      border-radius: 10px;
      padding: 24px;
      margin-bottom: 24px;

      h2 {
        font-size: 18px;
        margin-bottom: 14px;
        color: $text-primary;
      }

      ul {
        li {
          padding: 6px 0;
          font-size: 14px;
          color: $text-regular;
        }
      }
    }

    .back-link {
      text-align: center;

      a {
        color: $primary-color;
        font-size: 14px;
      }
    }
  }
}
</style>