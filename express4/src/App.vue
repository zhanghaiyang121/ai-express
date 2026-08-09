<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 当前路由信息可用于导航高亮等
const currentRoute = router.currentRoute
</script>

<template>
  <div id="app-container">
    <header class="app-header">
      <div class="header-inner">
        <router-link to="/" class="logo">Express4</router-link>
        <nav class="nav-links">
          <router-link to="/" active-class="active" exact>首页</router-link>
          <router-link to="/about" active-class="active">关于</router-link>
          <router-link to="/login" active-class="active">登录</router-link>
        </nav>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <footer class="app-footer">
      <p>Express4 - Vite + Vue3 + TypeScript 前端架构</p>
    </footer>
  </div>
</template>

<style lang="scss">
@use '@/styles/global.scss';
</style>

<style scoped lang="scss">
#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: $header-height;
  background-color: $bg-color-white;
  border-bottom: 1px solid $border-color-light;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 $content-padding;
  }

  .logo {
    font-size: 20px;
    font-weight: 700;
    color: $primary-color;
  }

  .nav-links {
    display: flex;
    gap: 24px;

    a {
      font-size: 14px;
      color: $text-regular;
      padding: 4px 0;
      border-bottom: 2px solid transparent;
      transition: color 0.3s, border-color 0.3s;

      &:hover {
        color: $primary-color;
      }

      &.active {
        color: $primary-color;
        border-bottom-color: $primary-color;
      }
    }
  }
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: $content-padding;
}

.app-footer {
  text-align: center;
  padding: 20px;
  font-size: 13px;
  color: $text-placeholder;
  border-top: 1px solid $border-color-light;
  margin-top: auto;
}
</style>