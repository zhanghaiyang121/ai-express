import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld 组件', () => {
  describe('渲染测试', () => {
    it('默认渲染 Hello World 标题', () => {
      const wrapper = mount(HelloWorld)
      expect(wrapper.find('h1').text()).toBe('Hello World')
    })

    it('传入 msg prop 时渲染自定义标题', () => {
      const wrapper = mount(HelloWorld, {
        props: { msg: '自定义标题' },
      })
      expect(wrapper.find('h1').text()).toBe('自定义标题')
    })

    it('渲染计数器按钮', () => {
      const wrapper = mount(HelloWorld)
      const btn = wrapper.find('button')
      expect(btn.exists()).toBe(true)
    })

    it('初始计数为 0', () => {
      const wrapper = mount(HelloWorld)
      expect(wrapper.find('button').text()).toBe('Count is 0')
    })

    it('渲染提示信息', () => {
      const wrapper = mount(HelloWorld)
      expect(wrapper.find('.tip').exists()).toBe(true)
      expect(wrapper.find('.tip').text()).toContain('Edit')
      expect(wrapper.find('.tip').text()).toContain('HelloWorld.vue')
    })
  })

  describe('计数器交互', () => {
    it('点击按钮 count 递增', async () => {
      const wrapper = mount(HelloWorld)
      const btn = wrapper.find('button')

      await btn.trigger('click')
      expect(btn.text()).toBe('Count is 1')

      await btn.trigger('click')
      expect(btn.text()).toBe('Count is 2')

      await btn.trigger('click')
      expect(btn.text()).toBe('Count is 3')
    })

    it('多次点击正确递增', async () => {
      const wrapper = mount(HelloWorld)
      const btn = wrapper.find('button')

      for (let i = 0; i < 10; i++) {
        await btn.trigger('click')
      }

      expect(btn.text()).toBe('Count is 10')
    })
  })

  describe('空 msg', () => {
    it('msg 为空字符串时显示 Hello World', () => {
      const wrapper = mount(HelloWorld, {
        props: { msg: '' },
      })
      expect(wrapper.find('h1').text()).toBe('Hello World')
    })
  })

  describe('Slot', () => {
    it('组件无 slot 内容', () => {
      const wrapper = mount(HelloWorld)
      // HelloWorld 使用 defineProps，msg 不是 slot
      expect(wrapper.find('.hello-world').exists()).toBe(true)
    })
  })
})