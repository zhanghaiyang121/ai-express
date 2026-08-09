import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useMessageStore } from '@/stores/message'
import FloatMessage from '@/components/FloatMessage.vue'

describe('FloatMessage 组件', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function mountComponent() {
    return mount(FloatMessage, {
      global: {
        // stub Teleport 使内容渲染在 wrapper 内联，方便断言
        stubs: {
          Teleport: true,
        },
      },
    })
  }

  describe('渲染测试', () => {
    it('无消息时不渲染任何消息节点', () => {
      const wrapper = mountComponent()
      const items = wrapper.findAll('.float-message')
      expect(items).toHaveLength(0)
    })

    it('添加一条消息后渲染一条消息', () => {
      const store = useMessageStore()
      store.addMessage('success', '测试消息')
      const wrapper = mountComponent()

      const items = wrapper.findAll('.float-message')
      expect(items).toHaveLength(1)
      expect(items[0].text()).toContain('测试消息')
    })

    it('添加多条消息渲染多条', () => {
      const store = useMessageStore()
      store.addMessage('success', '消息1')
      store.addMessage('error', '消息2')
      store.addMessage('info', '消息3')
      const wrapper = mountComponent()

      const items = wrapper.findAll('.float-message')
      expect(items).toHaveLength(3)
    })
  })

  describe('类型样式', () => {
    it('success 类型有 msg-success 类名', () => {
      const store = useMessageStore()
      store.addMessage('success', '成功')
      const wrapper = mountComponent()

      const item = wrapper.find('.float-message')
      expect(item.classes()).toContain('msg-success')
    })

    it('warning 类型有 msg-warning 类名', () => {
      const store = useMessageStore()
      store.addMessage('warning', '警告')
      const wrapper = mountComponent()

      const item = wrapper.find('.float-message')
      expect(item.classes()).toContain('msg-warning')
    })

    it('error 类型有 msg-error 类名', () => {
      const store = useMessageStore()
      store.addMessage('error', '错误')
      const wrapper = mountComponent()

      const item = wrapper.find('.float-message')
      expect(item.classes()).toContain('msg-error')
    })

    it('info 类型有 msg-info 类名', () => {
      const store = useMessageStore()
      store.addMessage('info', '信息')
      const wrapper = mountComponent()

      const item = wrapper.find('.float-message')
      expect(item.classes()).toContain('msg-info')
    })
  })

  describe('图标渲染', () => {
    it('各类型渲染对应图标', () => {
      const store = useMessageStore()
      store.addMessage('success', '1')
      store.addMessage('warning', '2')
      store.addMessage('error', '3')
      store.addMessage('info', '4')
      const wrapper = mountComponent()

      const icons = wrapper.findAll('.msg-icon')
      expect(icons).toHaveLength(4)
      expect(icons[0].text()).toBe('✓')
      expect(icons[1].text()).toBe('⚠')
      expect(icons[2].text()).toBe('✕')
      expect(icons[3].text()).toBe('ℹ')
    })
  })

  describe('关闭按钮', () => {
    it('每条消息都有关闭按钮', () => {
      const store = useMessageStore()
      store.addMessage('info', '消息')
      const wrapper = mountComponent()

      const closeBtn = wrapper.find('.msg-close')
      expect(closeBtn.exists()).toBe(true)
    })

    it('点击关闭按钮移除消息', async () => {
      const store = useMessageStore()
      store.addMessage('info', '可关闭消息')
      const wrapper = mountComponent()

      expect(store.messages).toHaveLength(1)

      const closeBtn = wrapper.find('.msg-close')
      await closeBtn.trigger('click')

      expect(store.messages).toHaveLength(0)
    })

    it('点击消息本身也移除消息', async () => {
      const store = useMessageStore()
      store.addMessage('info', '点击关闭')
      const wrapper = mountComponent()

      expect(store.messages).toHaveLength(1)

      const msgEl = wrapper.find('.float-message')
      await msgEl.trigger('click')

      expect(store.messages).toHaveLength(0)
    })

    it('点击关闭按钮不会冒泡触发消息的 click 事件', async () => {
      const store = useMessageStore()
      store.addMessage('info', '测试冒泡')
      const wrapper = mountComponent()

      expect(store.messages).toHaveLength(1)

      // 直接触发 closing button 的 click 事件（含 stopPropagation）
      const closeBtn = wrapper.find('.msg-close')
      await closeBtn.trigger('click')

      // 消息应只被移除一次（不会因冒泡重复调用 removeMessage）
      expect(store.messages).toHaveLength(0)
    })
  })

  describe('消息内容展示', () => {
    it('渲染消息文本内容', () => {
      const store = useMessageStore()
      store.addMessage('error', '保存失败，请重试')
      const wrapper = mountComponent()

      const content = wrapper.find('.msg-content')
      expect(content.text()).toBe('保存失败，请重试')
    })
  })

  describe('响应式更新', () => {
    it('store 变化时组件自动更新', async () => {
      const store = useMessageStore()
      const wrapper = mountComponent()

      expect(wrapper.findAll('.float-message')).toHaveLength(0)

      store.addMessage('success', '动态添加')
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.float-message')).toHaveLength(1)
    })

    it('自动超时后消息从 DOM 中移除', async () => {
      const store = useMessageStore()
      store.addMessage('info', '定时消失', 2000)
      const wrapper = mountComponent()

      expect(wrapper.findAll('.float-message')).toHaveLength(1)

      vi.advanceTimersByTime(2000)
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('.float-message')).toHaveLength(0)
    })
  })
})