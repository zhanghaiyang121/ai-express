<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="isCollapsed"
    :collapse-transition="false"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    class="sidebar-menu"
    router
  >
    <!-- 侧栏头部 Logo -->
    <div class="sidebar-logo" @click="router.push('/')">
      <img src="/vite.svg" alt="logo" class="logo-img" />
      <span v-if="!isCollapsed" class="logo-title">电商后台</span>
    </div>

    <!-- 菜单列表 -->
    <template v-for="route in menuRoutes" :key="route.path">
      <!-- 单级菜单（无子路由或hidden子路由） -->
      <el-menu-item
        v-if="!hasVisibleChildren(route)"
        :index="route.path"
        @click="handleMenuClick(route)"
      >
        <el-icon v-if="route.meta?.icon">
          <component :is="route.meta.icon" />
        </el-icon>
        <template #title>
          {{ route.meta?.title || route.name }}
        </template>
      </el-menu-item>

      <!-- 多级菜单 -->
      <el-sub-menu
        v-else
        :index="route.path"
      >
        <template #title>
          <el-icon v-if="route.meta?.icon">
            <component :is="route.meta.icon" />
          </el-icon>
          <span>{{ route.meta?.title || route.name }}</span>
        </template>
        <el-menu-item
          v-for="child in visibleChildren(route)"
          :key="child.path"
          :index="resolvePath(route.path, child.path)"
          @click="handleMenuClick(child)"
        >
          <span>{{ child.meta?.title || child.name }}</span>
        </el-menu-item>
      </el-sub-menu>
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, type RouteRecordRaw } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

/** 侧栏折叠状态 */
const isCollapsed = computed(() => appStore.sidebarCollapsed)

/** 当前激活菜单 */
const activeMenu = computed(() => route.path)

/** 菜单路由（从权限store获取） */
const menuRoutes = computed<RouteRecordRaw[]>(() => {
  const routes = permissionStore.addRoutes.length > 0
    ? permissionStore.addRoutes
    : permissionStore.routes

  return routes.filter((r) => {
    if (r.meta?.hidden) return false
    if (r.path === '/') return false
    return true
  })
})

/**
 * 判断路由是否有可见的子路由（非hidden）
 */
function hasVisibleChildren(routeConfig: RouteRecordRaw): boolean {
  if (!routeConfig.children || routeConfig.children.length === 0) {
    return false
  }
  return routeConfig.children.some((child) => !child.meta?.hidden)
}

/**
 * 获取可见的子路由
 */
function visibleChildren(routeConfig: RouteRecordRaw): RouteRecordRaw[] {
  if (!routeConfig.children) return []
  return routeConfig.children.filter((child) => !child.meta?.hidden)
}

/**
 * 拼接父路径与子路径，生成完整路由
 */
function resolvePath(parentPath: string, childPath: string): string {
  if (childPath.startsWith('/')) return childPath
  return `${parentPath}/${childPath}`
}

/**
 * 菜单点击处理
 */
function handleMenuClick(routeItem: RouteRecordRaw): void {
  // 有子路由则跳转到第一个可见子路由
  if (routeItem.children && routeItem.children.length > 0) {
    const firstVisible = routeItem.children.find((child) => !child.meta?.hidden)
    if (firstVisible) {
      router.push(resolvePath(routeItem.path, firstVisible.path))
      return
    }
  }
  router.push(routeItem.path)
}
</script>

<style lang="scss" scoped>
.sidebar-menu {
  width: $sidebar-width;
  height: 100vh;
  border-right: none;
  overflow-y: auto;
  overflow-x: hidden;

  &:not(.el-menu--collapse) {
    width: $sidebar-width;
  }

  &.el-menu--collapse {
    width: $sidebar-collapsed-width;
  }
}

.sidebar-logo {
  display: flex;
  align-items: center;
  height: $header-height;
  padding: 0 16px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;

  .logo-img {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .logo-title {
    margin-left: 10px;
    color: $color-white;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 1px;
  }
}
</style>