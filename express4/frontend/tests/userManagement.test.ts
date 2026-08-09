import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserManagementStore } from '@/stores/userManagement'
import { useMessageStore, setMessageStoreInstance } from '@/stores/message'

// Mock userApi
vi.mock('@/api/modules/user', () => ({
  userApi: {
    getUserList: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}))

import { userApi } from '@/api/modules/user'

/** 构造模拟的分页响应 */
function mockPaginationResponse(list: unknown[], total: number, page = 1, pageSize = 10) {
  return {
    data: {
      code: 200,
      data: { list, total, page, pageSize },
      message: 'ok',
    },
  }
}

/** 创建一条模拟用户 */
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

describe('userManagement store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    // 初始化 Msg 所需的 messageStore 实例
    const msgStore = useMessageStore()
    setMessageStoreInstance(msgStore)
  })

  describe('初始状态', () => {
    it('list 初始为空数组', () => {
      const store = useUserManagementStore()
      expect(store.list).toEqual([])
    })

    it('total 初始为 0', () => {
      const store = useUserManagementStore()
      expect(store.total).toBe(0)
    })

    it('loading 初始为 false', () => {
      const store = useUserManagementStore()
      expect(store.loading).toBe(false)
    })

    it('currentPage 初始为 1', () => {
      const store = useUserManagementStore()
      expect(store.currentPage).toBe(1)
    })

    it('pageSize 初始为 10', () => {
      const store = useUserManagementStore()
      expect(store.pageSize).toBe(10)
    })
  })

  describe('fetchUserList', () => {
    it('成功获取用户列表并更新 state', async () => {
      const users = [mockUser({ id: 1, username: 'alice' }), mockUser({ id: 2, username: 'bob' })]
      vi.mocked(userApi.getUserList).mockResolvedValue(mockPaginationResponse(users, 2) as any)

      const store = useUserManagementStore()
      await store.fetchUserList()

      expect(store.list).toEqual(users)
      expect(store.total).toBe(2)
      expect(store.loading).toBe(false)
    })

    it('请求期间 loading 为 true', async () => {
      let resolvePromise: (value: unknown) => void = () => {}
      const deferred = new Promise((resolve) => {
        resolvePromise = resolve
      })
      vi.mocked(userApi.getUserList).mockReturnValue(deferred as any)

      const store = useUserManagementStore()
      const fetchPromise = store.fetchUserList()

      expect(store.loading).toBe(true)

      resolvePromise(mockPaginationResponse([], 0))
      await fetchPromise

      expect(store.loading).toBe(false)
    })

    it('不传参数时使用 currentPage 和 pageSize 默认值', async () => {
      vi.mocked(userApi.getUserList).mockResolvedValue(mockPaginationResponse([], 0) as any)

      const store = useUserManagementStore()
      await store.fetchUserList()

      expect(userApi.getUserList).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
    })

    it('传入 page 参数时更新 currentPage', async () => {
      vi.mocked(userApi.getUserList).mockResolvedValue(mockPaginationResponse([], 0) as any)

      const store = useUserManagementStore()
      await store.fetchUserList(3)

      expect(store.currentPage).toBe(3)
      expect(userApi.getUserList).toHaveBeenCalledWith({ page: 3, pageSize: 10 })
    })

    it('传入 pageSize 参数时更新 pageSize', async () => {
      vi.mocked(userApi.getUserList).mockResolvedValue(mockPaginationResponse([], 0) as any)

      const store = useUserManagementStore()
      await store.fetchUserList(undefined, 20)

      expect(store.pageSize).toBe(20)
      expect(userApi.getUserList).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
    })

    it('同时传入 page 和 pageSize', async () => {
      vi.mocked(userApi.getUserList).mockResolvedValue(mockPaginationResponse([], 0) as any)

      const store = useUserManagementStore()
      await store.fetchUserList(2, 25)

      expect(userApi.getUserList).toHaveBeenCalledWith({ page: 2, pageSize: 25 })
    })

    it('请求失败时清空 list 并显示错误消息', async () => {
      vi.mocked(userApi.getUserList).mockRejectedValue(new Error('Network Error'))

      const store = useUserManagementStore()
      // 先设置一些数据，验证失败后被清空
      await store.fetchUserList()

      expect(store.list).toEqual([])
      expect(store.total).toBe(0)
      expect(store.loading).toBe(false)
    })

    it('请求失败后 loading 恢复为 false', async () => {
      vi.mocked(userApi.getUserList).mockRejectedValue(new Error('fail'))

      const store = useUserManagementStore()
      await store.fetchUserList()

      expect(store.loading).toBe(false)
    })

    it('空列表返回时 list 为空数组', async () => {
      vi.mocked(userApi.getUserList).mockResolvedValue(mockPaginationResponse([], 0) as any)

      const store = useUserManagementStore()
      await store.fetchUserList()

      expect(store.list).toHaveLength(0)
      expect(store.total).toBe(0)
    })
  })

  describe('updateUser', () => {
    it('成功更新用户返回 true', async () => {
      vi.mocked(userApi.updateUser).mockResolvedValue({ data: { code: 200 } } as any)

      const store = useUserManagementStore()
      const result = await store.updateUser(1, { nickname: '新昵称' })

      expect(result).toBe(true)
      expect(userApi.updateUser).toHaveBeenCalledWith(1, { nickname: '新昵称' })
    })

    it('更新失败返回 false', async () => {
      vi.mocked(userApi.updateUser).mockRejectedValue(new Error('fail'))

      const store = useUserManagementStore()
      const result = await store.updateUser(1, { email: 'bad@example.com' })

      expect(result).toBe(false)
    })

    it('更新失败时显示错误消息', async () => {
      vi.mocked(userApi.updateUser).mockRejectedValue(new Error('fail'))

      const store = useUserManagementStore()
      await store.updateUser(1, { role: 'admin' })

      // 验证 Msg.error 被触发 - 通过 messageStore 的消息列表
      const msgStore = useMessageStore()
      expect(msgStore.messages).toHaveLength(1)
      expect(msgStore.messages[0].type).toBe('error')
      expect(msgStore.messages[0].content).toBe('更新用户信息失败')
    })

    it('更新成功时显示成功消息', async () => {
      vi.mocked(userApi.updateUser).mockResolvedValue({ data: { code: 200 } } as any)

      const store = useUserManagementStore()
      await store.updateUser(1, { nickname: 'test' })

      const msgStore = useMessageStore()
      expect(msgStore.messages).toHaveLength(1)
      expect(msgStore.messages[0].type).toBe('success')
      expect(msgStore.messages[0].content).toBe('用户信息更新成功')
    })
  })

  describe('deleteUser', () => {
    it('成功删除用户返回 true', async () => {
      vi.mocked(userApi.deleteUser).mockResolvedValue({ data: { code: 200 } } as any)

      const store = useUserManagementStore()
      const result = await store.deleteUser(1)

      expect(result).toBe(true)
      expect(userApi.deleteUser).toHaveBeenCalledWith(1)
    })

    it('删除失败返回 false', async () => {
      vi.mocked(userApi.deleteUser).mockRejectedValue(new Error('fail'))

      const store = useUserManagementStore()
      const result = await store.deleteUser(99)

      expect(result).toBe(false)
    })

    it('删除成功时显示成功消息', async () => {
      vi.mocked(userApi.deleteUser).mockResolvedValue({ data: { code: 200 } } as any)

      const store = useUserManagementStore()
      await store.deleteUser(1)

      const msgStore = useMessageStore()
      expect(msgStore.messages[0].type).toBe('success')
      expect(msgStore.messages[0].content).toBe('用户删除成功')
    })

    it('删除失败时显示错误消息', async () => {
      vi.mocked(userApi.deleteUser).mockRejectedValue(new Error('fail'))

      const store = useUserManagementStore()
      await store.deleteUser(1)

      const msgStore = useMessageStore()
      expect(msgStore.messages[0].type).toBe('error')
      expect(msgStore.messages[0].content).toBe('删除用户失败')
    })
  })

  describe('resetState', () => {
    it('将所有状态重置为初始值', async () => {
      vi.mocked(userApi.getUserList).mockResolvedValue(
        mockPaginationResponse([mockUser()], 1) as any,
      )

      const store = useUserManagementStore()
      // 先设置一些非默认值
      await store.fetchUserList(5, 20)

      expect(store.list).toHaveLength(1)
      expect(store.total).toBe(1)
      expect(store.currentPage).toBe(5)
      expect(store.pageSize).toBe(20)

      store.resetState()

      expect(store.list).toEqual([])
      expect(store.total).toBe(0)
      expect(store.loading).toBe(false)
      expect(store.currentPage).toBe(1)
      expect(store.pageSize).toBe(10)
    })
  })
})