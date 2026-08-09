import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/modules/user'
import { Msg } from './message'
import type { UserInfo } from '@/types'

export const useUserManagementStore = defineStore('userManagement', () => {
  // ========== State ==========
  const list = ref<UserInfo[]>([])
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(10)

  // ========== Actions ==========

  /** 分页获取用户列表 */
  async function fetchUserList(page?: number, pageSizeParam?: number) {
    if (page !== undefined) currentPage.value = page
    if (pageSizeParam !== undefined) pageSize.value = pageSizeParam

    loading.value = true
    try {
      const res = await userApi.getUserList({
        page: currentPage.value,
        pageSize: pageSize.value,
      })
      const data = res.data.data
      list.value = data.list
      total.value = data.total
    } catch {
      Msg.error('获取用户列表失败')
    } finally {
      loading.value = false
    }
  }

  /** 更新用户信息 */
  async function updateUser(id: number, data: Partial<UserInfo>) {
    try {
      await userApi.updateUser(id, data)
      Msg.success('用户信息更新成功')
      return true
    } catch {
      Msg.error('更新用户信息失败')
      return false
    }
  }

  /** 删除用户 */
  async function deleteUser(id: number) {
    try {
      await userApi.deleteUser(id)
      Msg.success('用户删除成功')
      return true
    } catch {
      Msg.error('删除用户失败')
      return false
    }
  }

  /** 重置状态 */
  function resetState() {
    list.value = []
    total.value = 0
    loading.value = false
    currentPage.value = 1
    pageSize.value = 10
  }

  return {
    list,
    total,
    loading,
    currentPage,
    pageSize,
    fetchUserList,
    updateUser,
    deleteUser,
    resetState,
  }
})