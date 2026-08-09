/**
 * 权限状态管理 Store
 * 职责：动态路由管理、菜单权限过滤
 */
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import { constantRoutes, asyncRoutes } from '@/router'
import { useUserStore } from './user'
import router from '@/router'

interface PermissionState {
  /** 所有可访问路由 */
  routes: RouteRecordRaw[]
  /** 动态添加的路由 */
  addRoutes: RouteRecordRaw[]
}

/**
 * 过滤路由：根据用户权限过滤异步路由
 */
function filterRoutes(routes: RouteRecordRaw[], permissions: string[]): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = []

  for (const route of routes) {
    const cloned = { ...route }

    // 检查权限
    if (cloned.meta?.permission) {
      if (!permissions.includes(cloned.meta.permission as string) && !permissions.includes('*')) {
        continue
      }
    }

    // 递归处理子路由
    if (cloned.children) {
      cloned.children = filterRoutes(cloned.children, permissions)
      if (cloned.children.length === 0 && !cloned.redirect) {
        continue
      }
    }

    result.push(cloned)
  }

  return result
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: [],
    addRoutes: []
  }),

  actions: {
    /**
     * 生成可访问路由
     * 根据用户权限过滤异步路由，并动态注册到 router
     */
    generateRoutes(): RouteRecordRaw[] {
      const userStore = useUserStore()
      const permissions = userStore.permissions

      // 过滤异步路由
      const accessedRoutes = filterRoutes(asyncRoutes, permissions)

      // 动态添加到路由
      const layoutRoute = router.getRoutes().find((r) => r.name === 'Layout')
      if (layoutRoute) {
        for (const route of accessedRoutes) {
          router.addRoute('Layout', route)
        }
      }

      this.addRoutes = accessedRoutes
      this.routes = [...constantRoutes, ...accessedRoutes]

      return accessedRoutes
    },

    /**
     * 重置权限状态
     */
    resetPermission(): void {
      this.routes = []
      this.addRoutes = []
    }
  }
})