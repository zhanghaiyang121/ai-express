<script setup lang="ts">
// App.vue 现在是纯净的路由容器
// 后台管理布局由 Layout.vue 组件负责
// 登录页面独立渲染（不使用 Layout）
</script>

<template>
  <router-view />
</template>

<style lang="scss">
@use '@/styles/global.scss';
</style>