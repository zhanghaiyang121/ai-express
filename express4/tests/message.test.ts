import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMessageStore } from '@/stores/message'

describe('message store', () => {
  beforeEach(() => {
    // 每个测试前创建全新的 Pinia 实例
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基础功能', () => {
    it('初始状态消息列表为空', () => {
      const store = useMessageStore()
      expect(store.messages).toHaveLength(0)
    })

    it('addMessage 添加一条消息', () => {
      const store = useMessageStore()
      store.addMessage('success', '操作成功')
      expect(store.messages).toHaveLength(1)
      expect(store.messages[0].type).toBe('success')
      expect(store.messages[0].content).toBe('操作成功')
      expect(store.messages[0].duration).toBe(3000)
    })

    it('addMessage 支持自定义 duration', () => {
      const store = useMessageStore()
      store.addMessage('error', '失败了', 5000)
      expect(store.messages[0].duration).toBe(5000)
    })

    it('removeMessage 移除指定消息', () => {
      const store = useMessageStore()
      store.addMessage('info', '消息1')
      store.addMessage('info', '消息2')
      expect(store.messages).toHaveLength(2)

      const id = store.messages[0].id
      store.removeMessage(id)
      expect(store.messages).toHaveLength(1)
      expect(store.messages[0].content).toBe('消息2')
    })

    it('removeMessage 对不存在的 id 无影响', () => {
      const store = useMessageStore()
      store.addMessage('info', '消息')
      store.removeMessage(99999)
      expect(store.messages).toHaveLength(1)
    })

    it('clearAll 清空所有消息', () => {
      const store = useMessageStore()
      store.addMessage('info', '1')
      store.addMessage('info', '2')
      store.addMessage('info', '3')
      expect(store.messages).toHaveLength(3)

      store.clearAll()
      expect(store.messages).toHaveLength(0)
    })
  })

  describe('自动关闭', () => {
    it('默认 3 秒后自动移除消息', () => {
      const store = useMessageStore()
      store.addMessage('success', '自动消失')

      expect(store.messages).toHaveLength(1)

      // 快进 3 秒
      vi.advanceTimersByTime(3000)
      expect(store.messages).toHaveLength(0)
    })

    it('duration=0 的消息不会自动关闭', () => {
      const store = useMessageStore()
      store.addMessage('warning', '手动关闭', 0)

      vi.advanceTimersByTime(10000)
      expect(store.messages).toHaveLength(1)
    })

    it('自定义 duration 后按时关闭', () => {
      const store = useMessageStore()
      store.addMessage('error', '5秒后关闭', 5000)

      vi.advanceTimersByTime(4999)
      expect(store.messages).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(store.messages).toHaveLength(0)
    })

    it('多条消息各自独立计时', () => {
      const store = useMessageStore()
      store.addMessage('info', '先关闭', 2000)
      store.addMessage('error', '后关闭', 5000)

      vi.advanceTimersByTime(2000)
      expect(store.messages).toHaveLength(1)
      expect(store.messages[0].content).toBe('后关闭')

      vi.advanceTimersByTime(3000)
      expect(store.messages).toHaveLength(0)
    })
  })

  describe('便捷方法', () => {
    it('success() 添加 success 类型消息', () => {
      const store = useMessageStore()
      store.success('成功了')
      expect(store.messages[0].type).toBe('success')
      expect(store.messages[0].content).toBe('成功了')
    })

    it('warning() 添加 warning 类型消息', () => {
      const store = useMessageStore()
      store.warning('请注意')
      expect(store.messages[0].type).toBe('warning')
    })

    it('error() 添加 error 类型消息', () => {
      const store = useMessageStore()
      store.error('失败了')
      expect(store.messages[0].type).toBe('error')
    })

    it('info() 添加 info 类型消息', () => {
      const store = useMessageStore()
      store.info('提示')
      expect(store.messages[0].type).toBe('info')
    })

    it('便捷方法支持自定义 duration', () => {
      const store = useMessageStore()
      store.error('错误', 8000)
      expect(store.messages[0].duration).toBe(8000)
    })
  })

  describe('消息 ID 自增', () => {
    it('每条消息有唯一递增 ID', () => {
      const store = useMessageStore()
      store.addMessage('info', '1')
      store.addMessage('info', '2')
      store.addMessage('info', '3')

      expect(store.messages[0].id).toBeLessThan(store.messages[1].id)
      expect(store.messages[1].id).toBeLessThan(store.messages[2].id)
    })
  })

  describe('Timer 清理', () => {
    it('手动 removeMessage 时清除定时器', () => {
      const store = useMessageStore()
      store.addMessage('info', '消息', 5000)

      const item = store.messages[0]
      expect(item.timer).not.toBeNull()

      const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
      store.removeMessage(item.id)

      expect(clearSpy).toHaveBeenCalledWith(item.timer)
      clearSpy.mockRestore()
    })

    it('clearAll 时清除所有消息的定时器', () => {
      const store = useMessageStore()
      store.addMessage('info', '1', 3000)
      store.addMessage('info', '2', 5000)
      store.addMessage('info', '3', 0) // duration=0, timer 为 null

      const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
      store.clearAll()

      // duration=0 的消息 timer 为 null，不应调用 clearTimeout
      expect(clearSpy).toHaveBeenCalledTimes(2)
      clearSpy.mockRestore()
    })

    it('removeMessage 对 timer 为 null 的消息不报错', () => {
      const store = useMessageStore()
      store.addMessage('info', '手动关闭', 0)

      expect(store.messages[0].timer).toBeNull()
      expect(() => store.removeMessage(store.messages[0].id)).not.toThrow()
      expect(store.messages).toHaveLength(0)
    })
  })

  describe('边界情况', () => {
    it('负 duration 视为不自动关闭', () => {
      const store = useMessageStore()
      store.addMessage('error', '负duration', -1000)

      vi.advanceTimersByTime(20000)
      expect(store.messages).toHaveLength(1)
    })
  })
})
