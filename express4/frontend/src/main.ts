import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

// ========== 创建应用实例 ==========
const app = createApp(App)

// ========== 注册插件 ==========
// Element Plus UI 组件库
app.use(ElementPlus)

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

// 注册消息 Store 实例（供非组件上下文使用，如 API 拦截器）
import { useMessageStore, setMessageStoreInstance } from './stores'
const messageStore = useMessageStore()
setMessageStoreInstance(messageStore)

// ========== 挂载应用 ==========
app.mount('#app')
