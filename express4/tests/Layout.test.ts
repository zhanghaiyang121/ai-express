import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import Layout from '@/components/Layout.vue'

// Mock router
const mockPush = vi.fn()
const mockRoute = {
  path: '/dashboard',
  matched: [
    { path: '/', children: [
      { path: 'dashboard', meta: { title: '仪表盘', icon: '📊' } },
      { path: 'about', meta: { title: '关于系统', icon: 'ℹ️' } },
      { path: 'users', meta: { title: '用户管理', icon: '👥' } },
    ] },
  ],
}
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => mockRoute,
}))

// Stub FloatMessage
const FloatMessageStub = {
  template: '<div class="float-message-stub"></div>',
}

describe('Layout 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    setActivePinia(createPinia())
  })

  function mountLayout() {
    return mount(Layout, {
      global: {
        stubs: {
          FloatMessage: FloatMessageStub,
          'router-link': {
            template: '<a :class="$attrs.class"><slot /></a>',
            inheritAttrs: false,
          },
          'router-view': {
            template: '<div class="router-view-stub"><slot /></div>',
          },
        },
      },
    })
  }

  describe('渲染测试', () => {
    it('渲染顶部导航栏', () => {
      const wrapper = mountLayout()
      expect(wrapper.find('.top-bar').exists()).toBe(true)
    })

    it('渲染侧边栏', () => {
      const wrapper = mountLayout()
      expect(wrapper.find('.sidebar').exists()).toBe(true)
    })

    it('渲染主内容区域', () => {
      const wrapper = mountLayout()
      expect(wrapper.find('.main-content').exists()).toBe(true)
    })

    it('渲染侧边栏切换按钮', () => {
      const wrapper = mountLayout()
      expect(wrapper.find('.btn-toggle-sidebar').exists()).toBe(true)
      expect(wrapper.find('.btn-toggle-sidebar').text()).toBe('☰')
    })

    it('渲染 logo 文字', () => {
      const wrapper = mountLayout()
      expect(wrapper.find('.logo-text').text()).toBe('Express4 后台管理')
    })

    it('包含 FloatMessage 组件', () => {
      const wrapper = mountLayout()
      expect(wrapper.find('.float-message-stub').exists()).toBe(true)
    })

    it('包含 router-view', () => {
      const wrapper = mountLayout()
      expect(wrapper.find('.router-view-stub').exists()).toBe(true)
    })
  })

  describe('顶部导航', () => {
    it('渲染顶部导航项', () => {
      const wrapper = mountLayout()
      const navItems = wrapper.findAll('.top-nav-item')
      expect(navItems).toHaveLength(3)
    })

    it('顶部导航包含仪表盘、用户管理、关于系统', () => {
      const wrapper = mountLayout()
      const navItems = wrapper.findAll('.top-nav-item')
      const labels = navItems.map(item => item.text())
      expect(labels).toEqual(['仪表盘', '用户管理', '关于系统'])
    })

    it('当前路由对应导航项高亮', () => {
      // mockRoute.path 为 /dashboard，所以仪表盘应高亮
      const wrapper = mountLayout()
      const activeItem = wrapper.find('.top-nav-item.active')
      expect(activeItem.exists()).toBe(true)
      expect(activeItem.text()).toBe('仪表盘')
    })
  })

  describe('侧边栏菜单', () => {
    it('渲染侧边栏子菜单项', () => {
      const wrapper = mountLayout()
      const sidebarItems = wrapper.findAll('.sidebar-item')
      expect(sidebarItems).toHaveLength(3)
    })

    it('侧边栏菜单包含标题和图标', () => {
      const wrapper = mountLayout()
      const icons = wrapper.findAll('.sidebar-icon')
      const titles = wrapper.findAll('.sidebar-title')
      expect(icons).toHaveLength(3)
      expect(titles).toHaveLength(3)
    })

    it('折叠时侧边栏添加 collapsed 类', async () => {
      const wrapper = mountLayout()
      await wrapper.find('.btn-toggle-sidebar').trigger('click')
      expect(wrapper.find('.sidebar').classes()).toContain('collapsed')
    })

    it('点击侧边栏切换按钮折叠/展开', async () => {
      const wrapper = mountLayout()
      const btn = wrapper.find('.btn-toggle-sidebar')

      await btn.trigger('click')
      expect(wrapper.find('.sidebar').classes()).toContain('collapsed')

      await btn.trigger('click')
      expect(wrapper.find('.sidebar').classes()).not.toContain('collapsed')
    })
  })

  describe('用户状态', () => {
    it('未登录时显示登录链接', () => {
      const wrapper = mountLayout()
      // 默认未登录，应显示登录链接
      expect(wrapper.find('.btn-login').exists()).toBe(true)
      expect(wrapper.find('.btn-logout').exists()).toBe(false)
    })

    it('已登录时显示用户信息和退出按钮', async () => {
      // 模拟已登录状态
      const store = useUserStore()
      store.$patch({ token: 'test-token', userInfo: { id: 1, username: 'admin', nickname: '管理员', avatar: '', email: '', role: 'admin' } })

      const wrapper = mountLayout()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.user-info').exists()).toBe(true)
      expect(wrapper.find('.user-name').text()).toBe('管理员')
      expect(wrapper.find('.btn-logout').exists()).toBe(true)
      expect(wrapper.find('.btn-login').exists()).toBe(false)
    })

    it('点击退出按钮调用 logout 并跳转到登录页', async () => {
      const store = useUserStore()
      store.$patch({ token: 'test-token', userInfo: { id: 1, username: 'admin', nickname: '管理员', avatar: '', email: '', role: 'admin' } })

      const wrapper = mountLayout()
      await wrapper.vm.$nextTick()

      await wrapper.find('.btn-logout').trigger('click')

      expect(mockPush).toHaveBeenCalledWith('/login')
      expect(store.token).toBeNull()
    })

    it('用户无昵称时显示"未登录"', async () => {
      const store = useUserStore()
      store.$patch({ token: 'test-token' })

      const wrapper = mountLayout()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.user-name').text()).toBe('未登录')
    })
  })
})