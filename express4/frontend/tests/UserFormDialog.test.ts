import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useUserManagementStore } from '@/stores/userManagement'
import { useMessageStore, setMessageStoreInstance } from '@/stores/message'
import UserFormDialog from '@/components/UserFormDialog.vue'
import type { UserInfo } from '@/types'

// Mock userApi
vi.mock('@/api/modules/user', () => ({
  userApi: {
    updateUser: vi.fn(),
  },
}))

import { userApi } from '@/api/modules/user'

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

function mountDialog(props: { visible: boolean; user: UserInfo | null } = { visible: true, user: null }) {
  return mount(UserFormDialog, {
    props,
  })
}

describe('UserFormDialog 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const msgStore = useMessageStore()
    setMessageStoreInstance(msgStore)
  })

  describe('渲染测试', () => {
    it('visible=false 时不渲染任何内容', () => {
      const wrapper = mountDialog({ visible: false, user: null })
      expect(wrapper.find('.dialog-overlay').exists()).toBe(false)
    })

    it('visible=true 时渲染弹窗', () => {
      const wrapper = mountDialog({ visible: true, user: null })
      expect(wrapper.find('.dialog-overlay').exists()).toBe(true)
      expect(wrapper.find('.dialog-container').exists()).toBe(true)
    })

    it('创建模式标题为"新建用户"', () => {
      const wrapper = mountDialog({ visible: true, user: null })
      expect(wrapper.find('.dialog-title').text()).toBe('新建用户')
    })

    it('编辑模式标题为"编辑用户"', () => {
      const wrapper = mountDialog({ visible: true, user: mockUser() })
      expect(wrapper.find('.dialog-title').text()).toBe('编辑用户')
    })

    it('渲染所有表单字段（创建模式）', () => {
      const wrapper = mountDialog({ visible: true, user: null })
      // 应有 5 个字段：用户名、昵称、邮箱、角色、密码
      const labels = wrapper.findAll('.form-label')
      expect(labels).toHaveLength(5)
    })

    it('编辑模式不显示密码字段', () => {
      const wrapper = mountDialog({ visible: true, user: mockUser() })
      const labels = wrapper.findAll('.form-label')
      // 应有 4 个字段：用户名、昵称、邮箱、角色（无密码）
      expect(labels).toHaveLength(4)
    })

    it('渲染角色下拉选项', () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const options = wrapper.find('select').findAll('option')
      const optionTexts = options.map((opt) => opt.text())
      expect(optionTexts).toEqual(['管理员', '编辑者', '普通用户'])
    })

    it('渲染取消和提交按钮', () => {
      const wrapper = mountDialog({ visible: true, user: null })
      expect(wrapper.find('.btn-cancel').exists()).toBe(true)
      expect(wrapper.find('.btn-submit').exists()).toBe(true)
    })

    it('创建模式提交按钮文本为"创建"', () => {
      const wrapper = mountDialog({ visible: true, user: null })
      // 通过 nextTick 等待 watch 初始化
      const btn = wrapper.find('.btn-submit')
      expect(btn.text()).toBe('创建')
    })

    it('编辑模式提交按钮文本为"保存"', () => {
      const wrapper = mountDialog({ visible: true, user: mockUser() })
      const btn = wrapper.find('.btn-submit')
      expect(btn.text()).toBe('保存')
    })

    it('渲染关闭按钮', () => {
      const wrapper = mountDialog({ visible: true, user: null })
      expect(wrapper.find('.btn-close').exists()).toBe(true)
    })
  })

  describe('表单数据回显（编辑模式）', () => {
    it('编辑模式回显 username', async () => {
      const user = mockUser({ username: 'johndoe' })
      const wrapper = mountDialog({ visible: true, user })

      const usernameInput = wrapper.find('input[type="text"]')
      expect((usernameInput.element as HTMLInputElement).value).toBe('johndoe')
    })

    it('编辑模式 username 字段为只读', () => {
      const wrapper = mountDialog({ visible: true, user: mockUser() })
      const usernameInput = wrapper.find('input[type="text"]')
      expect(usernameInput.attributes('disabled')).toBeDefined()
    })

    it('编辑模式回显 nickname', () => {
      const user = mockUser({ nickname: '张三' })
      const wrapper = mountDialog({ visible: true, user })

      // nickname 是第 2 个 text input（第 1 个是 username）
      const inputs = wrapper.findAll('input[type="text"]')
      expect((inputs[1].element as HTMLInputElement).value).toBe('张三')
    })

    it('编辑模式回显 email', () => {
      const user = mockUser({ email: 'john@test.com' })
      const wrapper = mountDialog({ visible: true, user })

      const emailInput = wrapper.find('input[type="email"]')
      expect((emailInput.element as HTMLInputElement).value).toBe('john@test.com')
    })

    it('编辑模式回显 role', () => {
      const user = mockUser({ role: 'admin' })
      const wrapper = mountDialog({ visible: true, user })

      const select = wrapper.find('select')
      expect((select.element as HTMLSelectElement).value).toBe('admin')
    })

    it('编辑模式密码字段为空', () => {
      const wrapper = mountDialog({ visible: true, user: mockUser() })
      // 编辑模式没有密码字段，所以不需要验证
      expect(wrapper.find('input[type="password"]').exists()).toBe(false)
    })

    it('创建模式所有字段为空（role 默认为 user）', () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const inputs = wrapper.findAll('input[type="text"]')
      expect((inputs[0].element as HTMLInputElement).value).toBe('') // username
      expect((inputs[1].element as HTMLInputElement).value).toBe('') // nickname

      const emailInput = wrapper.find('input[type="email"]')
      expect((emailInput.element as HTMLInputElement).value).toBe('')

      const select = wrapper.find('select')
      expect((select.element as HTMLSelectElement).value).toBe('user')

      const passwordInput = wrapper.find('input[type="password"]')
      expect((passwordInput.element as HTMLInputElement).value).toBe('')
    })
  })

  describe('表单验证 - 用户名', () => {
    it('用户名为空时显示错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      // 使 username 保持空，直接提交
      await wrapper.find('.btn-submit').trigger('click')

      const errorEl = wrapper.find('.error-text')
      expect(errorEl.text()).toBe('用户名不能为空')
    })

    it('用户名格式不正确时显示错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const usernameInput = wrapper.find('input[type="text"]')
      await usernameInput.setValue('ab')
      await wrapper.find('.btn-submit').trigger('click')

      const errorEl = wrapper.find('.error-text')
      expect(errorEl.text()).toBe('用户名需3-20位，仅限字母数字下划线')
    })

    it('用户名含特殊字符时验证失败', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const usernameInput = wrapper.find('input[type="text"]')
      await usernameInput.setValue('user@name')
      await wrapper.find('.btn-submit').trigger('click')

      // 第一个 error-text 应该是用户名错误
      const errorEls = wrapper.findAll('.error-text')
      expect(errorEls[0].text()).toBe('用户名需3-20位，仅限字母数字下划线')
    })

    it('合法用户名不显示错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const usernameInput = wrapper.find('input[type="text"]')
      await usernameInput.setValue('valid_user123')
      await wrapper.find('.btn-submit').trigger('click')

      // username 字段不应有 error-text（但其他字段可能还有错误）
      const formGroup = wrapper.findAll('.form-group')[0]
      expect(formGroup.find('.error-text').exists()).toBe(false)
    })
  })

  describe('表单验证 - 昵称', () => {
    it('昵称为空时显示错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const usernameInput = wrapper.find('input[type="text"]')
      await usernameInput.setValue('validuser') // 让用户名通过
      await wrapper.find('.btn-submit').trigger('click')

      // 第二个 form-group 是昵称，应有错误
      const nickGroup = wrapper.findAll('.form-group')[1]
      expect(nickGroup.find('.error-text').text()).toBe('昵称不能为空')
    })

    it('昵称超过 20 字符时显示错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const inputs = wrapper.findAll('input[type="text"]')
      await inputs[0].setValue('validuser')
      await inputs[1].setValue('这是一个非常非常非常非常长的超长限制昵称哦')
      await wrapper.find('.btn-submit').trigger('click')

      const nickGroup = wrapper.findAll('.form-group')[1]
      expect(nickGroup.find('.error-text').text()).toBe('昵称不超过20个字符')
    })
  })

  describe('表单验证 - 邮箱', () => {
    it('邮箱为空时显示错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const inputs = wrapper.findAll('input[type="text"]')
      await inputs[0].setValue('validuser')
      await inputs[1].setValue('昵称')
      await wrapper.find('.btn-submit').trigger('click')

      const emailGroup = wrapper.findAll('.form-group')[2]
      expect(emailGroup.find('.error-text').text()).toBe('邮箱不能为空')
    })

    it('邮箱格式无效时显示错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const inputs = wrapper.findAll('input[type="text"]')
      await inputs[0].setValue('validuser')
      await inputs[1].setValue('昵称')
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('not-an-email')
      await wrapper.find('.btn-submit').trigger('click')

      const emailGroup = wrapper.findAll('.form-group')[2]
      expect(emailGroup.find('.error-text').text()).toBe('请输入有效的邮箱格式')
    })

    it('合法邮箱不显示错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const inputs = wrapper.findAll('input[type="text"]')
      await inputs[0].setValue('validuser')
      await inputs[1].setValue('昵称')
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('valid@example.com')
      await wrapper.find('.btn-submit').trigger('click')

      const emailGroup = wrapper.findAll('.form-group')[2]
      expect(emailGroup.find('.error-text').exists()).toBe(false)
    })
  })

  describe('表单验证 - 密码', () => {
    it('创建模式密码为空时显示错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const inputs = wrapper.findAll('input[type="text"]')
      await inputs[0].setValue('validuser')
      await inputs[1].setValue('昵称')
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('valid@test.com')
      await wrapper.find('.btn-submit').trigger('click')

      const passwordGroup = wrapper.findAll('.form-group')[4]
      expect(passwordGroup.find('.error-text').text()).toBe('密码不能为空')
    })

    it('密码少于 6 位时显示错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const inputs = wrapper.findAll('input[type="text"]')
      await inputs[0].setValue('validuser')
      await inputs[1].setValue('昵称')
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('valid@test.com')
      const passwordInput = wrapper.find('input[type="password"]')
      await passwordInput.setValue('12345')
      await wrapper.find('.btn-submit').trigger('click')

      const passwordGroup = wrapper.findAll('.form-group')[4]
      expect(passwordGroup.find('.error-text').text()).toBe('密码需6-20位')
    })

    it('密码超过 20 位时显示错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      const inputs = wrapper.findAll('input[type="text"]')
      await inputs[0].setValue('validuser')
      await inputs[1].setValue('昵称')
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('valid@test.com')
      const passwordInput = wrapper.find('input[type="password"]')
      await passwordInput.setValue('123456789012345678901')
      await wrapper.find('.btn-submit').trigger('click')

      const passwordGroup = wrapper.findAll('.form-group')[4]
      expect(passwordGroup.find('.error-text').text()).toBe('密码需6-20位')
    })
  })

  describe('事件发射', () => {
    it('点击取消按钮触发 close 事件', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.find('.btn-cancel').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('点击关闭按钮触发 close 事件', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.find('.btn-close').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('点击遮罩层触发 close 事件', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      await wrapper.find('.dialog-overlay').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('编辑模式提交', () => {
    it('编辑模式下表单验证通过后调用 store.updateUser', async () => {
      vi.mocked(userApi.updateUser).mockResolvedValue({ data: { code: 200 } } as any)
      const user = mockUser({ id: 10, username: 'editor_user', nickname: '原昵称', email: 'old@test.com', role: 'user' })
      const wrapper = mountDialog({ visible: true, user })

      // 修改昵称和邮箱
      const inputs = wrapper.findAll('input[type="text"]')
      // inputs[0] 是 username（disabled），inputs[1] 是 nickname
      await inputs[1].setValue('新昵称')
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('new@test.com')
      const select = wrapper.find('select')
      await select.setValue('admin')

      await wrapper.find('.btn-submit').trigger('click')
      await flushPromises()

      expect(userApi.updateUser).toHaveBeenCalledWith(10, {
        nickname: '新昵称',
        email: 'new@test.com',
        role: 'admin',
      })
    })

    it('编辑模式提交成功后触发 submit-success 和 close 事件', async () => {
      vi.mocked(userApi.updateUser).mockResolvedValue({ data: { code: 200 } } as any)
      const wrapper = mountDialog({ visible: true, user: mockUser() })

      // 修改昵称使其通过验证
      const inputs = wrapper.findAll('input[type="text"]')
      await inputs[1].setValue('新昵称')
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('valid@test.com')

      await wrapper.find('.btn-submit').trigger('click')
      await flushPromises()

      expect(wrapper.emitted('submit-success')).toBeTruthy()
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('编辑模式提交失败不触发 submit-success', async () => {
      vi.mocked(userApi.updateUser).mockRejectedValue(new Error('fail'))
      const wrapper = mountDialog({ visible: true, user: mockUser() })

      const inputs = wrapper.findAll('input[type="text"]')
      await inputs[1].setValue('新昵称')
      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('valid@test.com')

      await wrapper.find('.btn-submit').trigger('click')
      await flushPromises()

      expect(wrapper.emitted('submit-success')).toBeFalsy()
    })
  })

  describe('表单重置', () => {
    it('visible 从 false 变为 true 时创建模式重置表单', async () => {
      // 先渲染为不可见
      const wrapper = mountDialog({ visible: false, user: null })
      // 使 visible 为 true
      await wrapper.setProps({ visible: true })

      const usernameInput = wrapper.find('input[type="text"]')
      expect((usernameInput.element as HTMLInputElement).value).toBe('')
    })

    it('visible 变为 true 时清除之前的验证错误', async () => {
      const wrapper = mountDialog({ visible: true, user: null })
      // 触发验证错误
      await wrapper.find('.btn-submit').trigger('click')
      expect(wrapper.find('.error-text').exists()).toBe(true)

      // 关闭再打开
      await wrapper.setProps({ visible: false })
      await wrapper.setProps({ visible: true })

      expect(wrapper.find('.error-text').exists()).toBe(false)
    })
  })
})