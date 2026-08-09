import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// ========== 创建应用实例 ==========
const app = createApp(App)

// ========== 注册插件 ==========
// Pinia 状态管理
const pinia = createPinia()
app.use(pinia)

// Vue Router 路由
app.use(router)

// ========== 初始化 ==========
// 从本地存储恢复用户登录状态
import { useUserStore } from './stores'
const userStore = useUserStore()
userStore.restoreFromStorage()

// ========== 挂载应用 ==========
app.mount('#app')