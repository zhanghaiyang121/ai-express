/**
 * 用户状态管理 Store
 */
import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/auth'
import type { UserInfo, LoginParams } from '@/types'

const mockUserInfo: UserInfo = {
  id: 1, username: 'admin', nickname: '管理员', avatar: '',
  email: 'admin@example.com', phone: '138****8888', role: '超级管理员', permissions: ['*']
}

interface UserState { token: string | null; userInfo: UserInfo | null; permissions: string[] }

export const useUserStore = defineStore('user', {
  state: (): UserState => ({ token: getToken(), userInfo: null, permissions: [] }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo?.nickname || state.userInfo?.username || '',
    avatar: (state) => state.userInfo?.avatar || ''
  },
  actions: {
    async login(params: LoginParams): Promise<void> {
      const mockResponse = { token: 'mock_token_' + Date.now(), refreshToken: 'mock_refresh_' + Date.now() }
      this.token = mockResponse.token; setToken(mockResponse.token)
      this.userInfo = mockUserInfo; this.permissions = mockUserInfo.permissions
    },
    async getUserInfo(): Promise<void> {
      this.userInfo = mockUserInfo; this.permissions = mockUserInfo.permissions
    },
    logout(): void { this.resetState(); removeToken() },
    hasPermission(permission: string): boolean {
      if (!permission) return true; if (this.permissions.includes('*')) return true
      return this.permissions.includes(permission)
    },
    resetState(): void { this.token = null; this.userInfo = null; this.permissions = [] }
  }
})