import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserDeleteConfirm from '@/components/UserDeleteConfirm.vue'
import type { UserInfo } from '@/types'

function mockUser(overrides: Partial<UserInfo> = {}): UserInfo {
  return {
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    avatar: '',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
  }
}

describe('UserDeleteConfirm 组件', () => {
  describe('渲染测试', () => {
    it('visible=false 时不渲染任何内容', () => {
      const wrapper = mount(UserDeleteConfirm, {
        props: { visible: false, user: null },
      })
      expect(wrapper.find('.dialog-overlay').exists()).toBe(false)
    })

    it('visible=true 且 user 存在时渲染弹窗', () => {
      const user = mockUser({ username: 'jdoe', nickname: 'John Doe' })
      const wrapper = mount(UserDeleteConfirm, {
        props: { visible: true, user },
      })
      expect(wrapper.find('.dialog-overlay').exists()).toBe(true)
      expect(wrapper.find('.confirm-dialog').exists()).toBe(true)
    })

    it('渲染警告图标', () => {
      const wrapper = mount(UserDeleteConfirm, {
        props: { visible: true, user: mockUser() },
      })
      expect(wrapper.find('.confirm-icon').exists()).toBe(true)
      expect(wrapper.find('.confirm-icon').text()).toBe('⚠️')
    })

    it('渲染确认标题', () => {
      const wrapper = mount(UserDeleteConfirm, {
        props: { visible: true, user: mockUser() },
      })
      expect(wrapper.find('.confirm-title').text()).toBe('确认删除用户')
    })

    it('渲染用户信息', () => {
      const user = mockUser({ username: 'zhangsan', nickname: '张三' })
      const wrapper = mount(UserDeleteConfirm, {
        props: { visible: true, user },
      })

      const content = wrapper.find('.confirm-content')
      expect(content.text()).toContain('zhangsan')
      expect(content.text()).toContain('张三')
      expect(content.text()).toContain('此操作不可撤销')
    })

    it('user=null 时不渲染用户信息段落', () => {
      const wrapper = mount(UserDeleteConfirm, {
        props: { visible: true, user: null },
      })
      // v-if="user" 控制 content 段落是否渲染
      expect(wrapper.find('.confirm-content').exists()).toBe(false)
    })

    it('渲染取消和确认删除按钮', () => {
      const wrapper = mount(UserDeleteConfirm, {
        props: { visible: true, user: mockUser() },
      })

      const cancelBtn = wrapper.find('.btn-cancel')
      const confirmBtn = wrapper.find('.btn-confirm')

      expect(cancelBtn.exists()).toBe(true)
      expect(cancelBtn.text()).toBe('取消')
      expect(confirmBtn.exists()).toBe(true)
      expect(confirmBtn.text()).toBe('确认删除')
    })
  })

  describe('事件发射', () => {
    it('点击取消按钮触发 close 事件', async () => {
      const wrapper = mount(UserDeleteConfirm, {
        props: { visible: true, user: mockUser() },
      })

      await wrapper.find('.btn-cancel').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
      expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('点击确认删除按钮触发 confirm 事件并传递 user', async () => {
      const user = mockUser({ id: 42, username: 'to_delete' })
      const wrapper = mount(UserDeleteConfirm, {
        props: { visible: true, user },
      })

      await wrapper.find('.btn-confirm').trigger('click')

      expect(wrapper.emitted('confirm')).toBeTruthy()
      expect(wrapper.emitted('confirm')![0]).toEqual([user])
    })

    it('user=null 时点击确认不触发 confirm 事件', async () => {
      const wrapper = mount(UserDeleteConfirm, {
        props: { visible: true, user: null },
      })

      await wrapper.find('.btn-confirm').trigger('click')

      expect(wrapper.emitted('confirm')).toBeFalsy()
    })

    it('点击遮罩层触发 close 事件', async () => {
      const wrapper = mount(UserDeleteConfirm, {
        props: { visible: true, user: mockUser() },
      })

      await wrapper.find('.dialog-overlay').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })
})