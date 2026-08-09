<script setup lang="ts">
import { useAppStore, useUserStore, useMessageStore } from '@/stores'
import HelloWorld from '@/components/HelloWorld.vue'

const appStore = useAppStore()
const userStore = useUserStore()
const messageStore = useMessageStore()

// 设置页面标题
appStore.setPageTitle('首页')

/** 点击按钮弹出消息 */
function showMessage() {
  messageStore.success('你好！这是一条来自首页的消息弹窗 🎉')
}
</script>

<template>
  <div class="home-page">
    <HelloWorld msg="Vite + Vue3 + TypeScript" />

    <div class="demo-action">
      <button class="btn-message" @click="showMessage">点击弹出消息</button>
    </div>

    <div class="tech-stack">
      <h2>技术栈</h2>
      <div class="stack-list">
        <span class="stack-item">Vue 3</span>
        <span class="stack-item">TypeScript</span>
        <span class="stack-item">Vite</span>
        <span class="stack-item">Pinia</span>
        <span class="stack-item">Vue Router</span>
        <span class="stack-item">Axios</span>
        <span class="stack-item">Mitt</span>
        <span class="stack-item">ESLint</span>
        <span class="stack-item">Sass/SCSS</span>
      </div>
    </div>

    <div class="user-status">
      <p v-if="userStore.isLoggedIn">
        当前用户：{{ userStore.nickname }}
        <button class="btn-logout" @click="userStore.logout()">退出登录</button>
      </p>
      <p v-else>
        <router-link to="/login" class="link">去登录</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  padding: $content-padding;
  text-align: center;

  .demo-action {
    margin-top: 20px;

    .btn-message {
      padding: 12px 28px;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.55);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  .tech-stack {
    margin-top: 30px;
    padding: 20px;
    background: $bg-color-white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    h2 {
      margin-bottom: 16px;
      font-size: 18px;
      color: $text-primary;
    }

    .stack-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;

      .stack-item {
        padding: 6px 16px;
        background-color: $primary-color;
        color: #fff;
        border-radius: 20px;
        font-size: 13px;
      }
    }
  }

  .user-status {
    margin-top: 24px;
    font-size: 14px;
    color: $text-secondary;

    .btn-logout {
      margin-left: 12px;
      color: $danger-color;
      font-size: 13px;
      text-decoration: underline;
    }

    .link {
      color: $primary-color;
    }
  }
}
</style>