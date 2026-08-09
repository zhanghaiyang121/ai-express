/**
 * 应用全局状态管理 Store
 * 职责：侧栏折叠、全局设置等应用级状态
 */
import { defineStore } from 'pinia'

interface AppState {
  /** 侧栏是否折叠 */
  sidebarCollapsed: boolean
  /** 全局搜索关键词 */
  searchKeyword: string
  /** 是否为移动端 */
  isMobile: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapsed: false,
    searchKeyword: '',
    isMobile: false
  }),

  actions: {
    /** 切换侧栏折叠状态 */
    toggleSidebar(): void {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    /** 设置侧栏折叠状态 */
    setSidebarCollapsed(collapsed: boolean): void {
      this.sidebarCollapsed = collapsed
    },

    /** 设置搜索关键词 */
    setSearchKeyword(keyword: string): void {
      this.searchKeyword = keyword
    },

    /** 检测并设置是否为移动端 */
    checkMobile(): void {
      this.isMobile = window.innerWidth < 768
    }
  }
})