import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'

describe('app store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.title = ''
  })

  describe('初始状态', () => {
    it('sidebarCollapsed 初始为 false', () => {
      const store = useAppStore()
      expect(store.sidebarCollapsed).toBe(false)
    })

    it('globalLoading 初始为 false', () => {
      const store = useAppStore()
      expect(store.globalLoading).toBe(false)
    })

    it('pageTitle 初始为 Express4', () => {
      const store = useAppStore()
      expect(store.pageTitle).toBe('Express4')
    })
  })

  describe('toggleSidebar', () => {
    it('切换 sidebarCollapsed 为 true', () => {
      const store = useAppStore()
      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(true)
    })

    it('再次调用切回 false', () => {
      const store = useAppStore()
      store.toggleSidebar()
      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(false)
    })

    it('多次切换正确翻转', () => {
      const store = useAppStore()
      store.toggleSidebar()
      store.toggleSidebar()
      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(true)
    })
  })

  describe('setGlobalLoading', () => {
    it('设置为 true', () => {
      const store = useAppStore()
      store.setGlobalLoading(true)
      expect(store.globalLoading).toBe(true)
    })

    it('设置为 false', () => {
      const store = useAppStore()
      store.setGlobalLoading(true)
      store.setGlobalLoading(false)
      expect(store.globalLoading).toBe(false)
    })
  })

  describe('setPageTitle', () => {
    it('设置 pageTitle 并更新 document.title', () => {
      const store = useAppStore()
      store.setPageTitle('仪表盘')
      expect(store.pageTitle).toBe('仪表盘')
      expect(document.title).toBe('仪表盘 - Express4')
    })

    it('设置空标题时 document.title 为 Express4', () => {
      const store = useAppStore()
      store.setPageTitle('')
      expect(store.pageTitle).toBe('')
      expect(document.title).toBe('Express4')
    })

    it('多次设置 pageTitle', () => {
      const store = useAppStore()
      store.setPageTitle('首页')
      expect(store.pageTitle).toBe('首页')
      store.setPageTitle('用户管理')
      expect(store.pageTitle).toBe('用户管理')
      expect(document.title).toBe('用户管理 - Express4')
    })
  })
})