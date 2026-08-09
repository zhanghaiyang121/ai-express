import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useUserManagementStore } from '@/stores/userManagement'
import { useMessageStore, setMessageStoreInstance } from '@/stores/message'
import UserManagement from '@/views/UserManagement.vue'
import type { UserInfo } from '@/types'

// Mock userApi
vi.mock('@/api/modules/user', () => ({
  userApi: {
    getUserList: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}))

import { userApi } from '@/api/modules/user'

function mockUser(overrides: Partial<UserInfo> = {}): UserInfo {
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

describe('UserManagement 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const msgStore = useMessageStore()
    setMessageStoreInstance(msgStore)
  })

  function mountPage() {
    return mount(UserManagement, {
      global: {
        stubs: {
          UserTable: true,
          UserFormDialog: true,
          UserDeleteConfirm: true,
        },
      },
    })
  }

  describe('渲染测试', () => {
    it('渲染页面标题"用户管理"', () => {
      const wrapper = mountPage()
      expect(wrapper.find('.page-title').text()).toBe('用户管理')
    })

    it('渲染"+ 新建用户"按钮', () => {
      const wrapper = mountPage()
      const btn = wrapper.find('.btn-create')
      expect(btn.exists()).toBe(true)
      expect(btn.text()).toBe('+ 新建用户')
    })

    it('初始不显示表单弹窗 (formDialogVisible=false)', () => {
      const wrapper = mountPage()
      const vm = wrapper.vm as any
      expect(vm.formDialogVisible).toBe(false)
    })

    it('初始不显示删除确认弹窗 (deleteDialogVisible=false)', () => {
      const wrapper = mountPage()
      const vm = wrapper.vm as any
      expect(vm.deleteDialogVisible).toBe(false)
    })
  })

  describe('数据加载', () => {
    it('mounted 时调用 fetchUserList', () => {
      const store = useUserManagementStore()
      const fetchSpy = vi.spyOn(store, 'fetchUserList').mockResolvedValue()

      mountPage()

      expect(fetchSpy).toHaveBeenCalled()
      fetchSpy.mockRestore()
    })
  })

  describe('新建用户', () => {
    it('点击"+ 新建用户"打开表单弹窗', async () => {
      const wrapper = mountPage()
      await wrapper.find('.btn-create').trigger('click')

      const vm = wrapper.vm as any
      expect(vm.formDialogVisible).toBe(true)
      expect(vm.editingUser).toBeNull()
    })
  })

  describe('编辑用户', () => {
    it('handleEdit 设置 editingUser 并打开弹窗', () => {
      const wrapper = mountPage()
      const user = mockUser({ id: 42, username: 'editor' })

      const vm = wrapper.vm as any
      vm.handleEdit(user)

      expect(vm.editingUser).toEqual(user)
      expect(vm.formDialogVisible).toBe(true)
    })
  })

  describe('删除用户', () => {
    it('handleDelete 设置 deletingUser 并打开删除弹窗', () => {
      const wrapper = mountPage()
      const user = mockUser({ id: 99, username: 'to_delete' })

      const vm = wrapper.vm as any
      vm.handleDelete(user)

      expect(vm.deletingUser).toEqual(user)
      expect(vm.deleteDialogVisible).toBe(true)
    })
  })

  describe('表单关闭', () => {
    it('handleFormClose 关闭弹窗并清空 editingUser', () => {
      const wrapper = mountPage()
      const vm = wrapper.vm as any

      // 先打开编辑
      vm.editingUser = mockUser()
      vm.formDialogVisible = true

      vm.handleFormClose()

      expect(vm.formDialogVisible).toBe(false)
      expect(vm.editingUser).toBeNull()
    })
  })

  describe('表单提交成功', () => {
    it('handleFormSuccess 关闭弹窗并刷新列表', () => {
      const wrapper = mountPage()
      const store = useUserManagementStore()
      const fetchSpy = vi.spyOn(store, 'fetchUserList').mockResolvedValue()

      const vm = wrapper.vm as any
      vm.editingUser = mockUser()
      vm.formDialogVisible = true

      vm.handleFormSuccess()

      expect(vm.formDialogVisible).toBe(false)
      expect(vm.editingUser).toBeNull()
      expect(fetchSpy).toHaveBeenCalled()

      fetchSpy.mockRestore()
    })
  })

  describe('删除确认流程', () => {
    it('handleDeleteConfirm 调用 store.deleteUser', async () => {
      vi.mocked(userApi.deleteUser).mockResolvedValue({ data: { code: 200 } } as any)
      vi.mocked(userApi.getUserList).mockResolvedValue({
        data: { code: 200, data: { list: [], total: 0, page: 1, pageSize: 10 } },
      } as any)

      const wrapper = mountPage()
      const user = mockUser({ id: 77 })
      const store = useUserManagementStore()
      const deleteSpy = vi.spyOn(store, 'deleteUser')

      const vm = wrapper.vm as any
      vm.deletingUser = user
      vm.deleteDialogVisible = true

      await vm.handleDeleteConfirm(user)

      expect(deleteSpy).toHaveBeenCalledWith(77)
      deleteSpy.mockRestore()
    })

    it('handleDeleteConfirm 关闭弹窗并清空 deletingUser', async () => {
      vi.mocked(userApi.deleteUser).mockResolvedValue({ data: { code: 200 } } as any)

      const wrapper = mountPage()
      const user = mockUser({ id: 10 })

      const vm = wrapper.vm as any
      vm.deletingUser = user
      vm.deleteDialogVisible = true

      await vm.handleDeleteConfirm(user)

      expect(vm.deleteDialogVisible).toBe(false)
      expect(vm.deletingUser).toBeNull()
    })

    it('handleDeleteClose 关闭弹窗并清空 deletingUser', () => {
      const wrapper = mountPage()
      const vm = wrapper.vm as any
      vm.deletingUser = mockUser()
      vm.deleteDialogVisible = true

      vm.handleDeleteClose()

      expect(vm.deleteDialogVisible).toBe(false)
      expect(vm.deletingUser).toBeNull()
    })

    it('删除失败时不刷新列表', async () => {
      vi.mocked(userApi.deleteUser).mockRejectedValue(new Error('fail'))

      const wrapper = mountPage()
      const store = useUserManagementStore()
      const fetchSpy = vi.spyOn(store, 'fetchUserList').mockResolvedValue()

      const vm = wrapper.vm as any
      const user = mockUser({ id: 5 })
      vm.deletingUser = user
      vm.deleteDialogVisible = true

      await vm.handleDeleteConfirm(user)

      expect(fetchSpy).not.toHaveBeenCalled()
      fetchSpy.mockRestore()
    })
  })

  describe('分页', () => {
    it('handlePageChange 调用 fetchUserList', () => {
      const wrapper = mountPage()
      const store = useUserManagementStore()
      const fetchSpy = vi.spyOn(store, 'fetchUserList').mockResolvedValue()

      const vm = wrapper.vm as any
      vm.handlePageChange(3)

      expect(fetchSpy).toHaveBeenCalledWith(3)
      fetchSpy.mockRestore()
    })
  })
})