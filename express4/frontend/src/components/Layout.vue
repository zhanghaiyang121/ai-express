<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import FloatMessage from '@/components/FloatMessage.vue'
import UserAvatar from '@/components/UserAvatar.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

/** 侧边栏是否折叠 */
const sidebarCollapsed = ref(false)

/** 用户是否已登录 */
const isLoggedIn = computed(() => userStore.isLoggedIn)

/** 当前激活的菜单路径（用于顶部导航） */
const currentTopMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/dashboard')) return '/dashboard'
  if (path.startsWith('/about')) return '/about'
  if (path.startsWith('/users')) return '/users'
  if (path.startsWith('/api-tester')) return '/api-tester'
  return ''
})

/** 顶部主导航 */
const topNavItems = [
  { path: '/dashboard', label: '仪表盘' },
  { path: '/users', label: '用户管理' },
  { path: '/api-tester', label: '接口调试' },
  { path: '/about', label: '关于系统' },
]

/** 根据当前路由获取侧边栏子菜单 */
const sidebarMenus = computed(() => {
  const path = route.path
  // 获取当前匹配的路由的父路由配置
  const matched = route.matched
  // 找到 Layout 下的 children
  const layoutRoute = matched.find(m => m.path === '/' || m.path === '')
  if (!layoutRoute || !layoutRoute.children) return []

  return layoutRoute.children
    .filter(child => child.path && child.meta?.title)
    .map(child => ({
      path: child.path.startsWith('/') ? child.path : `/${child.path}`,
      title: child.meta?.title as string,
      icon: (child.meta?.icon as string) || '📄'
    }))
})

/** 判断当前路由是否在侧边栏高亮 */
function isSidebarActive(menuPath: string): boolean {
  return route.path === menuPath || route.path.startsWith(menuPath + '/')
}

/** 切换侧边栏折叠状态 */
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

/** 退出登录 */
function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-layout">
    <!-- ========== 顶部导航栏 ========== -->
    <header class="top-bar">
      <div class="top-bar-left">
        <button class="btn-toggle-sidebar" @click="toggleSidebar" title="折叠侧边栏">
          ☰
        </button>
        <router-link to="/dashboard" class="logo-text">Express4 后台管理</router-link>
      </div>

      <nav class="top-bar-nav">
        <router-link
          v-for="item in topNavItems"
          :key="item.path"
          :to="item.path"
          class="top-nav-item"
          :class="{ active: currentTopMenu === item.path }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="top-bar-right">
        <span v-if="isLoggedIn" class="user-info">
          <span class="user-avatar">👤</span>
          <span class="user-name">{{ userStore.nickname || '管理员' }}</span>
        </span>
        <button
          v-if="isLoggedIn"
          class="btn-logout"
          @click="handleLogout"
          title="退出登录"
        >
          退出
        </button>
        <UserAvatar v-if="isLoggedIn" />
        <router-link v-else to="/login" class="btn-login">登录</router-link>
      </div>
    </header>

    <div class="layout-body">
      <!-- ========== 左侧侧边栏 ========== -->
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <ul class="sidebar-menu">
          <li
            v-for="menu in sidebarMenus"
            :key="menu.path"
            class="sidebar-item"
            :class="{ active: isSidebarActive(menu.path) }"
          >
            <router-link :to="menu.path" class="sidebar-link">
              <span class="sidebar-icon">{{ menu.icon }}</span>
              <span v-show="!sidebarCollapsed" class="sidebar-title">{{ menu.title }}</span>
            </router-link>
          </li>
        </ul>
      </aside>

      <!-- ========== 右侧内容区域 ========== -->
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <!-- 全局消息组件 -->
    <FloatMessage />
  </div>
</template>

<style scoped lang="scss">
/* ========== 整体布局 ========== */
.admin-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bg-color;
}

/* ========== 顶部栏 ========== */
.top-bar {
  position: sticky;
  top: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  height: $header-height;
  padding: 0 20px;
  background-color: #1d2636;
  color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);

  .top-bar-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .btn-toggle-sidebar {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #bcc9d6;
      border-radius: 4px;
      transition: background-color 0.2s, color 0.2s;
      flex-shrink: 0;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
    }

    .logo-text {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 1px;
      white-space: nowrap;
    }
  }
}

.top-bar-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 40px;

  .top-nav-item {
    padding: 8px 16px;
    font-size: 14px;
    color: #bcc9d6;
    border-radius: 6px;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    &.active {
      background-color: $primary-color;
      color: #fff;
    }
  }
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;

  .user-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #e8edf2;

    .user-avatar {
      font-size: 18px;
    }

    .user-name {
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .btn-logout {
    padding: 6px 12px;
    font-size: 13px;
    color: #bcc9d6;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background-color: $danger-color;
      color: #fff;
      border-color: $danger-color;
    }
  }

  .btn-login {
    padding: 6px 16px;
    font-size: 13px;
    color: #fff;
    background-color: $primary-color;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: color-mix(in srgb, $primary-color, #000 10%);
    }
  }
}

/* ========== 主体区域（侧边栏 + 内容） ========== */
.layout-body {
  display: flex;
  flex: 1;
}

/* ========== 侧边栏 ========== */
.sidebar {
  width: $sidebar-width;
  min-width: $sidebar-width;
  background-color: #263043;
  overflow-y: auto;
  transition: width 0.25s ease, min-width 0.25s ease;

  &.collapsed {
    width: 60px;
    min-width: 60px;
  }
}

.sidebar-menu {
  padding: 8px 0;
}

.sidebar-item {
  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    font-size: 14px;
    color: #a5b4cb;
    transition: background-color 0.2s, color 0.2s;
    border-left: 3px solid transparent;
    white-space: nowrap;

    .sidebar-icon {
      flex-shrink: 0;
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    .sidebar-title {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &:hover .sidebar-link {
    background-color: rgba(255, 255, 255, 0.04);
    color: #e0e6ed;
  }

  &.active .sidebar-link {
    background-color: rgba(64, 158, 255, 0.12);
    color: $primary-color;
    border-left-color: $primary-color;
  }
}

/* ========== 主内容区域 ========== */
.main-content {
  flex: 1;
  padding: $content-padding;
  overflow-y: auto;
  background-color: $bg-color;
}

/* ========== 响应式 ========== */
@media (max-width: $screen-sm) {
  .top-bar-nav {
    display: none;
  }

  .sidebar {
    width: 60px;
    min-width: 60px;

    &:not(.collapsed) {
      width: 60px;
      min-width: 60px;
    }
  }

  .top-bar-left .logo-text {
    font-size: 15px;
  }
}
</style>