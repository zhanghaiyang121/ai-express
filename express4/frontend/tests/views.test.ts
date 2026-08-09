import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import NotFound from '@/views/NotFound.vue'

// Stub HelloWorld component
const HelloWorldStub = {
  template: '<div class="hello-world-stub"><h1>{{ msg }}</h1></div>',
  props: { msg: String },
}

const mountOptions = {
  global: {
    stubs: {
      HelloWorld: HelloWorldStub,
      'router-link': { template: '<a><slot /></a>' },
    },
  },
}

describe('Home 页面', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    document.title = ''
  })

  it('设置页面标题为"首页"', () => {
    mount(Home, mountOptions)
    expect(document.title).toBe('首页 - Express4')
  })

  it('渲染 HelloWorld 组件', () => {
    const wrapper = mount(Home, mountOptions)
    expect(wrapper.find('.hello-world-stub').exists()).toBe(true)
  })

  it('渲染技术栈列表', () => {
    const wrapper = mount(Home, mountOptions)
    const stackItems = wrapper.findAll('.stack-item')
    expect(stackItems.length).toBeGreaterThan(0)
    expect(stackItems.some(item => item.text() === 'Vue 3')).toBe(true)
    expect(stackItems.some(item => item.text() === 'TypeScript')).toBe(true)
    expect(stackItems.some(item => item.text() === 'Pinia')).toBe(true)
  })

  it('渲染"点击弹出消息"按钮', () => {
    const wrapper = mount(Home, mountOptions)
    const btn = wrapper.find('.btn-message')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('点击弹出消息')
  })

  it('未登录时显示"去登录"链接', () => {
    const wrapper = mount(Home, mountOptions)
    expect(wrapper.find('.link').exists()).toBe(true)
    expect(wrapper.find('.btn-logout').exists()).toBe(false)
  })

  it('点击弹出消息按钮触发消息', async () => {
    const wrapper = mount(Home, mountOptions)
    await wrapper.find('.btn-message').trigger('click')
    const { useMessageStore } = await import('@/stores/message')
    const msgStore = useMessageStore()
    expect(msgStore.messages).toHaveLength(1)
    expect(msgStore.messages[0].type).toBe('success')
    expect(msgStore.messages[0].content).toContain('你好！')
  })
})

const aboutMountOptions = {
  global: {
    stubs: {
      'router-link': { template: '<a><slot /></a>' },
    },
  },
}

describe('About 页面', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.title = ''
  })

  it('设置页面标题为"关于"', () => {
    mount(About, aboutMountOptions)
    expect(document.title).toBe('关于 - Express4')
  })

  it('渲染页面标题', () => {
    const wrapper = mount(About, aboutMountOptions)
    expect(wrapper.find('h1').text()).toBe('关于 Express4')
  })

  it('渲染项目特性列表', () => {
    const wrapper = mount(About, aboutMountOptions)
    const features = wrapper.findAll('.features li')
    expect(features.length).toBeGreaterThan(0)
    expect(features.some(li => li.text().includes('Vue 3'))).toBe(true)
    expect(features.some(li => li.text().includes('Pinia'))).toBe(true)
    expect(features.some(li => li.text().includes('TypeScript'))).toBe(true)
  })

  it('渲染返回首页链接', () => {
    const wrapper = mount(About, aboutMountOptions)
    expect(wrapper.find('.back-link').exists()).toBe(true)
  })
})

const notFoundMountOptions = {
  global: {
    stubs: {
      'router-link': { template: '<a><slot /></a>' },
    },
  },
}

describe('NotFound 页面', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.title = ''
  })

  it('设置页面标题为"页面不存在"', () => {
    mount(NotFound, notFoundMountOptions)
    expect(document.title).toBe('页面不存在 - Express4')
  })

  it('渲染 404 文字', () => {
    const wrapper = mount(NotFound, notFoundMountOptions)
    expect(wrapper.find('h1').text()).toBe('404')
  })

  it('渲染提示信息', () => {
    const wrapper = mount(NotFound, notFoundMountOptions)
    expect(wrapper.find('p').text()).toBe('抱歉，您访问的页面不存在')
  })

  it('渲染返回首页链接', () => {
    const wrapper = mount(NotFound, notFoundMountOptions)
    const link = wrapper.find('.back-link')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('返回首页')
  })
})