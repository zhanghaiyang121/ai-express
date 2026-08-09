<template>
  <div class="layout-container">
    <LayoutSidebar class="layout-sidebar" />
    <div class="layout-main" :class="{ collapsed: sidebarCollapsed }">
      <LayoutHeader class="layout-header" />
      <div class="layout-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import LayoutSidebar from './Sidebar.vue'
import LayoutHeader from './Header.vue'

const appStore = useAppStore()
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
</script>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.layout-sidebar {
  flex-shrink: 0;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

.layout-header {
  flex-shrink: 0;
  height: $header-height;
}

.layout-content {
  flex: 1;
  overflow-y: auto;
  padding: $content-padding;
  background-color: $color-bg;
}
</style>