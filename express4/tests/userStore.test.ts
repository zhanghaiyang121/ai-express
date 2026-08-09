import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import { storage } from '@/utils/storage'

// Mock userApi
vi.mock('@/api', () => ({
  userApi: {
    login: vi.fn(),
    getUserInfo: vi.fn(),
  },
}))

import { userApi } from '@/api'
import eventBus from '@/utils/eventBus'

/** 构造模拟用户 */
function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    avatar: '',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
  }
}

describe('user store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 清空 localStorage
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('初始状态', () => {
    it('token 初始为 null', () => {
      const store = useUserStore()
      expect(store.token).toBeNull()
    })

    it('userInfo 初始为 null', () => {
      const store = useUserStore()
      expect(store.userInfo).toBeNull()
    })

    it('isLoggedIn 初始为 false', () => {
      const store = useUserStore()
      expect(store.isLoggedIn).toBe(false)
    })

    it('nickname 初始为"未登录"', () => {
      const store = useUserStore()
      expect(store.nickname).toBe('未登录')
    })

    it('username 初始为空字符串', () => {
      const store = useUserStore()
      expect(store.username).toBe('')
    })

    it('avatar 初始为空字符串', () => {
      const store = useUserStore()
      expect(store.avatar).toBe('')
    })

    it('role 初始为空字符串', () => {
      const store = useUserStore()
      expect(store.role).toBe('')
    })
  })

  describe('login', () => {
    it('登录成功后 token 和 userInfo 被正确设置', async () => {
      const user = mockUser({ username: 'admin', nickname: '管理员' })
      vi.mocked(userApi.login).mockResolvedValue({
        data: { data: { token: 'test-token-123', userInfo: user } },
      } as any)

      const store = useUserStore()
      await store.login({ username: 'admin', password: 'pass123' })

      expect(store.token).toBe('test-token-123')
      expect(store.userInfo).toEqual(user)
      expect(store.isLoggedIn).toBe(true)
    })

    it('登录成功后 token 持久化到 localStorage', async () => {
      const user = mockUser()
      vi.mocked(userApi.login).mockResolvedValue({
        data: { data: { token: 'persist-token', userInfo: user } },
      } as any)

      const store = useUserStore()
      await store.login({ username: 'u', password: 'p' })

      expect(storage.getToken()).toBe('persist-token')
      expect(storage.get('userInfo')).toEqual(user)
    })

    it('登录成功触发 user:login 事件', async () => {
      const spy = vi.fn()
      eventBus.on('user:login', spy)
      const user = mockUser()
      vi.mocked(userApi.login).mockResolvedValue({
        data: { data: { token: 'evt-token', userInfo: user } },
      } as any)

      const store = useUserStore()
      await store.login({ username: 'u', password: 'p' })

      expect(spy).toHaveBeenCalledWith({ token: 'evt-token' })
      eventBus.off('user:login', spy)
    })

    it('登录失败抛出错误', async () => {
      vi.mocked(userApi.login).mockRejectedValue(new Error('用户名或密码错误'))

      const store = useUserStore()
      await expect(store.login({ username: 'u', password: 'wrong' })).rejects.toThrow('用户名或密码错误')
    })

    it('登录失败后 isLoggedIn 保持 false', async () => {
      vi.mocked(userApi.login).mockRejectedValue(new Error('fail'))

      const store = useUserStore()
      try {
        await store.login({ username: 'u', password: 'p' })
      } catch {}

      expect(store.isLoggedIn).toBe(false)
      expect(store.token).toBeNull()
    })
  })

  describe('fetchUserInfo', () => {
    it('成功获取用户信息', async () => {
      const user = mockUser({ nickname: '远程用户' })
      vi.mocked(userApi.getUserInfo).mockResolvedValue({
        data: { data: user },
      } as any)

      const store = useUserStore()
      await store.fetchUserInfo()

      expect(store.userInfo).toEqual(user)
      expect(store.nickname).toBe('远程用户')
    })

    it('获取用户信息后将数据持久化', async () => {
      const user = mockUser({ nickname: '持久化' })
      vi.mocked(userApi.getUserInfo).mockResolvedValue({
        data: { data: user },
      } as any)

      const store = useUserStore()
      await store.fetchUserInfo()

      expect(storage.get('userInfo')).toEqual(user)
    })

    it('获取用户信息失败抛出错误', async () => {
      vi.mocked(userApi.getUserInfo).mockRejectedValue(new Error('网络错误'))

      const store = useUserStore()
      await expect(store.fetchUserInfo()).rejects.toThrow('网络错误')
    })
  })

  describe('logout', () => {
    it('清空 token 和 userInfo', async () => {
      const user = mockUser()
      vi.mocked(userApi.login).mockResolvedValue({
        data: { data: { token: 't', userInfo: user } },
      } as any)
      const store = useUserStore()
      await store.login({ username: 'u', password: 'p' })

      store.logout()

      expect(store.token).toBeNull()
      expect(store.userInfo).toBeNull()
      expect(store.isLoggedIn).toBe(false)
    })

    it('登出后清除 localStorage 中的 token 和 userInfo', async () => {
      const user = mockUser()
      vi.mocked(userApi.login).mockResolvedValue({
        data: { data: { token: 'cleanup-token', userInfo: user } },
      } as any)
      const store = useUserStore()
      await store.login({ username: 'u', password: 'p' })

      store.logout()

      expect(storage.getToken()).toBeNull()
      expect(storage.get('userInfo')).toBeNull()
    })

    it('登出触发 user:logout 事件', () => {
      const spy = vi.fn()
      eventBus.on('user:logout', spy)

      const store = useUserStore()
      store.logout()

      expect(spy).toHaveBeenCalled()
      eventBus.off('user:logout', spy)
    })
  })

  describe('restoreFromStorage', () => {
    it('从 localStorage 恢复 token', () => {
      storage.setToken('saved-token')

      const store = useUserStore()
      store.restoreFromStorage()

      expect(store.token).toBe('saved-token')
      expect(store.isLoggedIn).toBe(true)
    })

    it('从 localStorage 恢复 userInfo', () => {
      const user = mockUser({ username: 'saved_user' })
      storage.set('userInfo', user)

      const store = useUserStore()
      store.restoreFromStorage()

      expect(store.userInfo).toEqual(user)
      expect(store.nickname).toBe('测试用户')
    })

    it('同时恢复 token 和 userInfo', () => {
      const user = mockUser({ nickname: '恢复的用户' })
      storage.setToken('restore-token')
      storage.set('userInfo', user)

      const store = useUserStore()
      store.restoreFromStorage()

      expect(store.token).toBe('restore-token')
      expect(store.userInfo).toEqual(user)
      expect(store.isLoggedIn).toBe(true)
      expect(store.nickname).toBe('恢复的用户')
    })

    it('storage 无数据时保持默认值', () => {
      const store = useUserStore()
      store.restoreFromStorage()

      expect(store.token).toBeNull()
      expect(store.userInfo).toBeNull()
      expect(store.isLoggedIn).toBe(false)
    })

    it('仅 token 存在时只恢复 token', () => {
      storage.setToken('partial-token')

      const store = useUserStore()
      store.restoreFromStorage()

      expect(store.token).toBe('partial-token')
      expect(store.userInfo).toBeNull()
    })

    it('仅 userInfo 存在时只恢复 userInfo', () => {
      const user = mockUser({ username: 'info_only' })
      storage.set('userInfo', user)

      const store = useUserStore()
      store.restoreFromStorage()

      expect(store.token).toBeNull()
      expect(store.userInfo).toEqual(user)
    })
  })

  describe('computed getters', () => {
    it('nickname getter 返回用户昵称', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue({
        data: { data: mockUser({ nickname: '小明' }) },
      } as any)
      const store = useUserStore()
      await store.fetchUserInfo()

      expect(store.nickname).toBe('小明')
    })

    it('nickname getter 无用户信息时返回"未登录"', () => {
      const store = useUserStore()
      expect(store.nickname).toBe('未登录')
    })

    it('username getter 返回用户名', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue({
        data: { data: mockUser({ username: 'zhangsan' }) },
      } as any)
      const store = useUserStore()
      await store.fetchUserInfo()

      expect(store.username).toBe('zhangsan')
    })

    it('avatar getter 返回头像', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue({
        data: { data: mockUser({ avatar: 'https://example.com/avatar.png' }) },
      } as any)
      const store = useUserStore()
      await store.fetchUserInfo()

      expect(store.avatar).toBe('https://example.com/avatar.png')
    })

    it('role getter 返回角色', async () => {
      vi.mocked(userApi.getUserInfo).mockResolvedValue({
        data: { data: mockUser({ role: 'admin' }) },
      } as any)
      const store = useUserStore()
      await store.fetchUserInfo()

      expect(store.role).toBe('admin')
    })
  })
})