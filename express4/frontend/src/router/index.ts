import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import eventBus from '@/utils/eventBus'

// ========== 主布局（后台管理嵌套路由） ==========
const Layout = () => import('@/components/Layout.vue')

// ========== 路由配置 ==========
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', noAuth: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Home.vue'),
        meta: { title: '仪表盘', icon: '📊' }
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: { title: '关于系统', icon: 'ℹ️' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue'),
        meta: { title: '用户管理', icon: '👥' }
      },
      {
        path: 'api-tester',
        name: 'ApiTester',
        component: () => import('@/views/ApiTester.vue'),
        meta: { title: '接口调试', icon: '🔧' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: Layout,
    children: [
      {
        path: '',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: { title: '404' }
      }
    ]
  }
]

// ========== 创建路由实例 ==========
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// ========== 路由守卫 ==========
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Express4`
  }

  // 发送路由变更事件
  eventBus.emit('route:changed', { to: to.fullPath, from: from.fullPath })

  next()
})

export default router