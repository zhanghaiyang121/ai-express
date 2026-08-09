/**
 * 应用入口文件
 * 职责：创建 Vue 实例、注册插件、挂载应用
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import permission from './directives/permission'
import './styles/global.scss'

const app = createApp(App)

// Pinia 状态管理
app.use(createPinia())

// Vue Router 路由
app.use(router)

// 注册自定义指令
app.directive('permission', permission)

app.mount('#app')