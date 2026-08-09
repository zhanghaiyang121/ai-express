import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore, useAppStore } from '@/stores'
import Login from '@/views/Login.vue'
import type { LoginParams } from '@/types'

// Mock router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useRoute: () => ({}),
}))

// Mock userApi
vi.mock('@/api', () => ({
  userApi: {
    login: vi.fn(),
  },
}))

import { userApi } from '@/api'

describe('Login 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    document.title = ''
  })

  function mountLogin() {
    return mount(Login, {
      global: {
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    })
  }

  describe('渲染测试', () => {
    it('渲染登录标题', () => {
      const wrapper = mountLogin()
      expect(wrapper.find('h1').text()).toBe('用户登录')
    })

    it('渲染用户名输入框', () => {
      const wrapper = mountLogin()
      const usernameInput = wrapper.find('#username')
      expect(usernameInput.exists()).toBe(true)
      expect(usernameInput.attributes('type')).toBe('text')
    })

    it('渲染密码输入框', () => {
      const wrapper = mountLogin()
      const passwordInput = wrapper.find('#password')
      expect(passwordInput.exists()).toBe(true)
      expect(passwordInput.attributes('type')).toBe('password')
    })

    it('渲染登录按钮', () => {
      const wrapper = mountLogin()
      const btn = wrapper.find('.btn-submit')
      expect(btn.exists()).toBe(true)
      expect(btn.text()).toBe('登 录')
    })

    it('渲染返回首页链接', () => {
      const wrapper = mountLogin()
      expect(wrapper.find('.back-link a').text()).toContain('返回首页')
    })

    it('设置页面标题为"登录"', () => {
      mountLogin()
      expect(document.title).toBe('登录 - Express4')
    })
  })

  describe('表单绑定', () => {
    it('用户名 v-model 双向绑定', async () => {
      const wrapper = mountLogin()
      const input = wrapper.find('#username')
      await input.setValue('admin')

      const vm = wrapper.vm as any
      expect(vm.loginForm.username).toBe('admin')
    })

    it('密码 v-model 双向绑定', async () => {
      const wrapper = mountLogin()
      const input = wrapper.find('#password')
      await input.setValue('secret123')

      const vm = wrapper.vm as any
      expect(vm.loginForm.password).toBe('secret123')
    })
  })

  describe('表单验证', () => {
    it('用户名为空时提交显示错误', async () => {
      const wrapper = mountLogin()
      await wrapper.find('.btn-submit').trigger('click')

      expect(wrapper.find('.error-msg').text()).toBe('请输入用户名和密码')
    })

    it('密码为空时提交显示错误', async () => {
      const wrapper = mountLogin()
      await wrapper.find('#username').setValue('admin')
      await wrapper.find('.btn-submit').trigger('click')

      expect(wrapper.find('.error-msg').text()).toBe('请输入用户名和密码')
    })

    it('用户名和密码都有值时进入登录流程', async () => {
      vi.mocked(userApi.login).mockResolvedValue({
        data: {
          data: { token: 't', userInfo: { id: 1, username: 'admin', nickname: 'Admin', avatar: '', email: '', role: 'admin' } },
        },
      } as any)

      const wrapper = mountLogin()
      await wrapper.find('#username').setValue('admin')
      await wrapper.find('#password').setValue('pass')
      await wrapper.find('.btn-submit').trigger('click')
      await flushPromises()

      // 验证错误信息被清空（因为成功进入了 login 流程）
      expect(wrapper.find('.error-msg').exists()).toBe(false)
    })

    it('用户名有空格时算作空', async () => {
      const wrapper = mountLogin()
      // 只有空格
      await wrapper.find('#username').setValue('   ')
      await wrapper.find('#password').setValue('pass')
      await wrapper.find('.btn-submit').trigger('click')

      expect(wrapper.find('.error-msg').text()).toBe('请输入用户名和密码')
    })
  })

  describe('登录流程', () => {
    it('登录成功后跳转到首页', async () => {
      vi.mocked(userApi.login).mockResolvedValue({
        data: {
          data: {
            token: 'jwt-token',
            userInfo: { id: 1, username: 'admin', nickname: '管理员', avatar: '', email: 'admin@test.com', role: 'admin' },
          },
        },
      } as any)

      const wrapper = mountLogin()
      await wrapper.find('#username').setValue('admin')
      await wrapper.find('#password').setValue('correct')
      await wrapper.find('.btn-submit').trigger('click')
      await flushPromises()

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('登录过程中按钮显示"登录中..."且禁用', async () => {
      // 延迟 resolve 以便检查 loading 状态
      let resolvePromise: (value: unknown) => void = () => {}
      vi.mocked(userApi.login).mockReturnValue(new Promise((resolve) => {
        resolvePromise = resolve
      }) as any)

      const wrapper = mountLogin()
      await wrapper.find('#username').setValue('admin')
      await wrapper.find('#password').setValue('pass')
      await wrapper.find('.btn-submit').trigger('click')

      await wrapper.vm.$nextTick()

      const btn = wrapper.find('.btn-submit')
      expect(btn.text()).toBe('登录中...')
      expect(btn.attributes('disabled')).toBeDefined()

      // 完成请求
      resolvePromise({ data: { data: { token: 't', userInfo: { id: 1, username: 'a', nickname: 'n', avatar: '', email: '', role: 'user' } } } })
      await flushPromises()
    })

    it('登录失败显示错误信息', async () => {
      vi.mocked(userApi.login).mockRejectedValue(new Error('用户名或密码错误'))

      const wrapper = mountLogin()
      await wrapper.find('#username').setValue('admin')
      await wrapper.find('#password').setValue('wrong')
      await wrapper.find('.btn-submit').trigger('click')
      await flushPromises()

      expect(wrapper.find('.error-msg').text()).toBe('用户名或密码错误')
    })

    it('登录失败后 loading 状态恢复', async () => {
      vi.mocked(userApi.login).mockRejectedValue(new Error('fail'))

      const wrapper = mountLogin()
      await wrapper.find('#username').setValue('admin')
      await wrapper.find('#password').setValue('wrong')
      await wrapper.find('.btn-submit').trigger('click')
      await flushPromises()

      const btn = wrapper.find('.btn-submit')
      expect(btn.text()).toBe('登 录')
      expect(btn.attributes('disabled')).toBeUndefined()
    })

    it('登录失败没有 message 属性时显示默认错误', async () => {
      vi.mocked(userApi.login).mockRejectedValue(new Error())

      const wrapper = mountLogin()
      await wrapper.find('#username').setValue('admin')
      await wrapper.find('#password').setValue('pass')
      await wrapper.find('.btn-submit').trigger('click')
      await flushPromises()

      expect(wrapper.find('.error-msg').text()).toBe('登录失败')
    })

    it('提交表单时阻止默认行为 (preventDefault)', async () => {
      vi.mocked(userApi.login).mockResolvedValue({
        data: {
          data: { token: 't', userInfo: { id: 1, username: 'a', nickname: 'n', avatar: '', email: '', role: 'user' } },
        },
      } as any)

      const wrapper = mountLogin()
      await wrapper.find('#username').setValue('admin')
      await wrapper.find('#password').setValue('pass')

      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(userApi.login).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('错误状态管理', () => {
    it('提交验证通过后清除先前的错误信息', async () => {
      vi.mocked(userApi.login).mockRejectedValue(new Error('第一次失败'))

      const wrapper = mountLogin()
      // 第一次提交失败
      await wrapper.find('#username').setValue('admin')
      await wrapper.find('#password').setValue('wrong')
      await wrapper.find('.btn-submit').trigger('click')
      await flushPromises()
      expect(wrapper.find('.error-msg').text()).toBe('第一次失败')

      // 第二次提交（用户修改密码后）
      vi.mocked(userApi.login).mockRejectedValue(new Error('第二次失败'))
      await wrapper.find('#password').setValue('another')
      await wrapper.find('.btn-submit').trigger('click')
      await flushPromises()

      // 错误信息被更新
      expect(wrapper.find('.error-msg').text()).toBe('第二次失败')
    })
  })
})