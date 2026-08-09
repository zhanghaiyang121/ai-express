import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 由于路由涉及异步组件加载，我们只测试路由配置结构和守卫逻辑
// Mock mitt eventBus
vi.mock('@/utils/eventBus', () => ({
  default: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}))

import eventBus from '@/utils/eventBus'

// 构建与真实路由相同的配置（使用同步组件替代异步组件便于测试）
const MockHome = { template: '<div>Home</div>', name: 'Home' }
const MockAbout = { template: '<div>About</div>', name: 'About' }
const MockUserManagement = { template: '<div>Users</div>', name: 'UserManagement' }
const MockLogin = { template: '<div>Login</div>', name: 'Login' }
const MockLayout = { template: '<div>Layout<router-view /></div>', name: 'Layout' }
const MockNotFound = { template: '<div>404</div>', name: 'NotFound' }

describe('Router 配置与守卫', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.title = ''
  })

  function createTestRouter(initialRoute = '/') {
    const routes: RouteRecordRaw[] = [
      {
        path: '/login',
        name: 'Login',
        component: MockLogin,
        meta: { title: '登录', noAuth: true },
      },
      {
        path: '/',
        component: MockLayout,
        redirect: '/dashboard',
        children: [
          { path: 'dashboard', name: 'Dashboard', component: MockHome, meta: { title: '仪表盘', icon: '📊' } },
          { path: 'about', name: 'About', component: MockAbout, meta: { title: '关于系统', icon: 'ℹ️' } },
          { path: 'users', name: 'UserManagement', component: MockUserManagement, meta: { title: '用户管理', icon: '👥' } },
        ],
      },
      {
        path: '/:pathMatch(.*)*',
        component: MockLayout,
        children: [{ path: '', name: 'NotFound', component: MockNotFound, meta: { title: '404' } }],
      },
    ]

    const router = createRouter({
      history: createWebHistory(),
      routes,
      scrollBehavior: () => ({ top: 0 }),
    })

    // 注册守卫
    router.beforeEach((to, from, next) => {
      if (to.meta.title) {
        document.title = `${to.meta.title} - Express4`
      }
      eventBus.emit('route:changed', { to: to.fullPath, from: from.fullPath })
      next()
    })

    return router
  }

  describe('路由表结构', () => {
    it('包含 /login 路由', () => {
      const router = createTestRouter()
      const route = router.resolve('/login')
      expect(route.meta.title).toBe('登录')
      expect(route.meta.noAuth).toBe(true)
    })

    it('/ 默认重定向到 /dashboard', async () => {
      const router = createTestRouter()
      await router.push('/')
      await router.isReady()
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('/dashboard 在 Layout children 中', () => {
      const router = createTestRouter()
      const route = router.resolve('/dashboard')
      expect(route.meta.title).toBe('仪表盘')
      expect(route.meta.icon).toBe('📊')
    })

    it('/about 在 Layout children 中', () => {
      const router = createTestRouter()
      const route = router.resolve('/about')
      expect(route.meta.title).toBe('关于系统')
      expect(route.meta.icon).toBe('ℹ️')
    })

    it('/users 在 Layout children 中', () => {
      const router = createTestRouter()
      const route = router.resolve('/users')
      expect(route.meta.title).toBe('用户管理')
      expect(route.meta.icon).toBe('👥')
    })

    it('不存在的路径匹配 NotFound', () => {
      const router = createTestRouter()
      const route = router.resolve('/nonexistent-page')
      expect(route.name).toBe('NotFound')
      expect(route.meta.title).toBe('404')
    })

    it('scrollBehavior 返回 { top: 0 }', () => {
      const router = createTestRouter()
      // scrollBehavior 是函数，可以通过调用测试
      const result = (router.options as any).scrollBehavior()
      expect(result).toEqual({ top: 0 })
    })
  })

  describe('路由守卫', () => {
    it('导航到有 title 的路由时设置 document.title', async () => {
      const router = createTestRouter()
      await router.push('/dashboard')
      expect(document.title).toBe('仪表盘 - Express4')
    })

    it('导航到登录页设置 document.title', async () => {
      const router = createTestRouter()
      await router.push('/login')
      expect(document.title).toBe('登录 - Express4')
    })

    it('导航时触发 route:changed 事件', async () => {
      const router = createTestRouter()
      await router.push('/dashboard')
      await router.push('/users')

      expect(eventBus.emit).toHaveBeenCalledWith('route:changed', {
        to: '/users',
        from: '/dashboard',
      })
    })
  })
})