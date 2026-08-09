import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 消息类型 */
export type MessageType = 'success' | 'warning' | 'error' | 'info'

/** 单条消息 */
export interface MessageItem {
  id: number
  type: MessageType
  content: string
  duration: number // 0 表示不自动关闭
  timer: ReturnType<typeof setTimeout> | null
}

export const useMessageStore = defineStore('message', () => {
  const messages = ref<MessageItem[]>([])
  let nextId = 0

  /** 添加一条消息 */
  function addMessage(type: MessageType, content: string, duration = 3000) {
    const id = ++nextId
    const item: MessageItem = {
      id,
      type,
      content,
      duration,
      timer: null,
    }

    messages.value.push(item)

    if (duration > 0) {
      item.timer = setTimeout(() => {
        removeMessage(id)
      }, duration)
    }
  }

  /** 移除指定消息 */
  function removeMessage(id: number) {
    const idx = messages.value.findIndex((m) => m.id === id)
    if (idx === -1) return

    const item = messages.value[idx]
    if (item.timer) {
      clearTimeout(item.timer)
    }

    messages.value.splice(idx, 1)
  }

  /** 清空所有消息 */
  function clearAll() {
    messages.value.forEach((item) => {
      if (item.timer) clearTimeout(item.timer)
    })
    messages.value = []
  }

  // ========== 便捷方法 ==========
  function success(content: string, duration?: number) {
    addMessage('success', content, duration)
  }

  function warning(content: string, duration?: number) {
    addMessage('warning', content, duration)
  }

  function error(content: string, duration?: number) {
    addMessage('error', content, duration)
  }

  function info(content: string, duration?: number) {
    addMessage('info', content, duration)
  }

  return {
    messages,
    addMessage,
    removeMessage,
    clearAll,
    success,
    warning,
    error,
    info,
  }
})

/** 非组件上下文中使用的消息工具（适用于 JS/TS 文件） */
let _messageStore: ReturnType<typeof useMessageStore> | null = null

export function setMessageStoreInstance(instance: ReturnType<typeof useMessageStore>) {
  _messageStore = instance
}

export function getMessageStore(): ReturnType<typeof useMessageStore> | null {
  return _messageStore
}

/** 独立使用：在非 setup 上下文中弹出消息 */
export const Msg = {
  success(content: string, duration?: number) {
    _messageStore?.success(content, duration)
  },
  warning(content: string, duration?: number) {
    _messageStore?.warning(content, duration)
  },
  error(content: string, duration?: number) {
    _messageStore?.error(content, duration)
  },
  info(content: string, duration?: number) {
    _messageStore?.info(content, duration)
  },
}