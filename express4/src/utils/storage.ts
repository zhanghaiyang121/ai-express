/**
 * localStorage 封装工具
 * 支持自动序列化/反序列化 JSON 数据
 */

const PREFIX = 'EXPRESS4_'

export const storage = {
  /**
   * 设置存储项
   */
  set(key: string, value: unknown): void {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(PREFIX + key, serialized)
    } catch (e) {
      console.error('[Storage] Failed to set item:', key, e)
    }
  },

  /**
   * 获取存储项
   */
  get<T = unknown>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (raw === null) return null
      return JSON.parse(raw) as T
    } catch (e) {
      console.error('[Storage] Failed to get item:', key, e)
      return null
    }
  },

  /**
   * 移除存储项
   */
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
  },

  /**
   * 清空所有前缀匹配的存储项
   */
  clear(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  },

  /**
   * 获取 Token 快捷方法
   */
  getToken(): string | null {
    return this.get<string>('token')
  },

  /**
   * 设置 Token 快捷方法
   */
  setToken(token: string): void {
    this.set('token', token)
  },

  /**
   * 移除 Token 快捷方法
   */
  removeToken(): void {
    this.remove('token')
  }
}