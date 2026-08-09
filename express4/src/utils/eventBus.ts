import mitt from 'mitt'

// ========== 事件类型定义 ==========
type Events = {
  // 用户相关
  'user:login': { token: string }
  'user:logout': void
  'user:profile-updated': void

  // 全局通知
  'global:loading': boolean
  'global:message': { type: 'success' | 'warning' | 'error' | 'info'; content: string }

  // 路由相关
  'route:changed': { to: string; from: string }
}

const eventBus = mitt<Events>()

export default eventBus
export type { Events }