import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '@/utils/storage'
import { userApi } from '@/api'
import type { UserInfo, LoginParams } from '@/types'
import eventBus from '@/utils/eventBus'

/**
 * 用户状态管理
 */
export const useUserStore = defineStore('user', () => {
  // ========== State ==========
  const token = ref<string | null>(storage.getToken())
  const userInfo = ref<UserInfo | null>(null)

  // ========== Getters ==========
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => userInfo.value?.username || '')
  const nickname = computed(() => userInfo.value?.nickname || '未登录')
  const avatar = computed(() => userInfo.value?.avatar || '')
  const role = computed(() => userInfo.value?.role || '')

  // ========== Actions ==========
  /**
   * 登录
   */
  async function login(params: LoginParams) {
    const { data } = await userApi.login(params)
    const { token: newToken, userInfo: info } = data.data

    token.value = newToken
    userInfo.value = info

    storage.setToken(newToken)
    storage.set('userInfo', info)

    eventBus.emit('user:login', { token: newToken })
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo() {
    try {
      const { data } = await userApi.getUserInfo()
      userInfo.value = data.data
      storage.set('userInfo', data.data)
    } catch (e) {
      console.error('[UserStore] Failed to fetch user info:', e)
      throw e
    }
  }

  /**
   * 登出
   */
  function logout() {
    token.value = null
    userInfo.value = null

    storage.removeToken()
    storage.remove('userInfo')

    eventBus.emit('user:logout')
  }

  /**
   * 从本地存储恢复登录态
   */
  function restoreFromStorage() {
    const savedToken = storage.getToken()
    const savedUserInfo = storage.get<UserInfo>('userInfo')

    if (savedToken) {
      token.value = savedToken
    }
    if (savedUserInfo) {
      userInfo.value = savedUserInfo
    }
  }

  return {
    // State
    token,
    userInfo,
    // Getters
    isLoggedIn,
    username,
    nickname,
    avatar,
    role,
    // Actions
    login,
    fetchUserInfo,
    logout,
    restoreFromStorage
  }
})