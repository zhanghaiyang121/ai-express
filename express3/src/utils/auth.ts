/**
 * Token 管理工具
 * 职责：本地 Token 的存取、清除、验证
 */
const TOKEN_KEY = 'admin_token'
const REFRESH_TOKEN_KEY = 'admin_refresh_token'

/** 获取 Token */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/** 设置 Token */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/** 获取 Refresh Token */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/** 设置 Refresh Token */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/** 移除所有 Token */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/** 检查是否已登录（Token 存在即为已登录） */
export function isLoggedIn(): boolean {
  return getToken() !== null
}