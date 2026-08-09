<script setup lang="ts">
import { useAppStore } from '@/stores'

const appStore = useAppStore()
appStore.setPageTitle('页面不存在')
</script>

<template>
  <div class="not-found-page">
    <h1>404</h1>
    <p>抱歉，您访问的页面不存在</p>
    <router-link to="/" class="back-link">返回首页</router-link>
  </div>
</template>

<style scoped lang="scss">
.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;

  h1 {
    font-size: 6rem;
    color: $primary-color;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    color: $text-secondary;
    margin-bottom: 28px;
  }

  .back-link {
    padding: 10px 28px;
    font-size: 14px;
    color: #fff;
    background-color: $primary-color;
    border-radius: 6px;

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>