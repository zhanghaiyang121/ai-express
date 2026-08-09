import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 应用全局状态管理
 */
export const useAppStore = defineStore('app', () => {
  // ========== State ==========
  const sidebarCollapsed = ref(false)
  const globalLoading = ref(false)
  const pageTitle = ref('Express4')

  // ========== Actions ==========
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setGlobalLoading(loading: boolean) {
    globalLoading.value = loading
  }

  function setPageTitle(title: string) {
    pageTitle.value = title
    document.title = title ? `${title} - Express4` : 'Express4'
  }

  return {
    sidebarCollapsed,
    globalLoading,
    pageTitle,
    toggleSidebar,
    setGlobalLoading,
    setPageTitle
  }
})