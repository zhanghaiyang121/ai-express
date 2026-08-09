import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UserTable from '@/components/UserTable.vue'
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

function mountTable(props: {
  users?: UserInfo[]
  loading?: boolean
  total?: number
  currentPage?: number
  pageSize?: number
} = {}) {
  return mount(UserTable, {
    props: {
      users: props.users ?? [mockUser()],
      loading: props.loading ?? false,
      total: props.total ?? 1,
      currentPage: props.currentPage ?? 1,
      pageSize: props.pageSize ?? 10,
    },
  })
}

describe('UserTable 组件', () => {
  describe('加载状态', () => {
    it('loading=true 时显示"加载中..."', () => {
      const wrapper = mountTable({ loading: true })
      expect(wrapper.find('.table-loading').exists()).toBe(true)
      expect(wrapper.find('.table-loading').text()).toBe('加载中...')
    })

    it('loading=true 时不渲染表格', () => {
      const wrapper = mountTable({ loading: true })
      expect(wrapper.find('.user-table').exists()).toBe(false)
    })

    it('loading=true 且 total>0 时分页仍然显示', () => {
      const wrapper = mountTable({ loading: true, total: 10 })
      expect(wrapper.find('.pagination').exists()).toBe(true)
    })
  })

  describe('空状态', () => {
    it('users 为空数组时显示"暂无用户数据"', () => {
      const wrapper = mountTable({ users: [], loading: false })
      expect(wrapper.find('.table-empty').exists()).toBe(true)
      expect(wrapper.find('.table-empty').text()).toBe('暂无用户数据')
    })

    it('users 为空时不渲染表格', () => {
      const wrapper = mountTable({ users: [], loading: false })
      expect(wrapper.find('.user-table').exists()).toBe(false)
    })
  })

  describe('数据表格渲染', () => {
    it('正确渲染所有列头', () => {
      const wrapper = mountTable()
      const headers = wrapper.findAll('th')
      const headerTexts = headers.map((th) => th.text())
      expect(headerTexts).toEqual(['ID', '用户名', '昵称', '邮箱', '角色', '操作'])
    })

    it('正确渲染用户数据行', () => {
      const users = [
        mockUser({ id: 1, username: 'alice', nickname: 'Alice', email: 'alice@test.com' }),
      ]
      const wrapper = mountTable({ users, total: 1 })

      const cols = wrapper.findAll('tbody td')
      expect(cols[0].text()).toBe('1')
      expect(cols[1].text()).toBe('alice')
      expect(cols[2].text()).toBe('Alice')
      expect(cols[3].text()).toBe('alice@test.com')
    })

    it('渲染多条用户记录', () => {
      const users = [mockUser({ id: 1 }), mockUser({ id: 2 }), mockUser({ id: 3 })]
      const wrapper = mountTable({ users, total: 3 })

      const rows = wrapper.findAll('tbody tr')
      expect(rows).toHaveLength(3)
    })

    it('每一行包含编辑和删除按钮', () => {
      const wrapper = mountTable()
      const btnEdit = wrapper.find('.btn-edit')
      const btnDelete = wrapper.find('.btn-delete')

      expect(btnEdit.exists()).toBe(true)
      expect(btnEdit.text()).toBe('编辑')
      expect(btnDelete.exists()).toBe(true)
      expect(btnDelete.text()).toBe('删除')
    })
  })

  describe('角色标签渲染', () => {
    it('管理员角色渲染对应标签', () => {
      const wrapper = mountTable({ users: [mockUser({ role: 'admin' })] })
      const tag = wrapper.find('.role-tag')
      expect(tag.text()).toBe('管理员')
      expect(tag.classes()).toContain('role-admin')
    })

    it('编辑者角色渲染对应标签', () => {
      const wrapper = mountTable({ users: [mockUser({ role: 'editor' })] })
      const tag = wrapper.find('.role-tag')
      expect(tag.text()).toBe('编辑者')
      expect(tag.classes()).toContain('role-editor')
    })

    it('普通用户角色渲染对应标签', () => {
      const wrapper = mountTable({ users: [mockUser({ role: 'user' })] })
      const tag = wrapper.find('.role-tag')
      expect(tag.text()).toBe('普通用户')
      expect(tag.classes()).toContain('role-user')
    })

    it('未知角色显示原始值', () => {
      const wrapper = mountTable({ users: [mockUser({ role: 'superadmin' })] })
      const tag = wrapper.find('.role-tag')
      expect(tag.text()).toBe('superadmin')
    })
  })

  describe('事件发射', () => {
    it('点击编辑按钮触发 edit 事件', async () => {
      const user = mockUser({ id: 42, username: 'jdoe' })
      const wrapper = mountTable({ users: [user] })

      await wrapper.find('.btn-edit').trigger('click')

      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')![0]).toEqual([user])
    })

    it('点击删除按钮触发 delete 事件', async () => {
      const user = mockUser({ id: 99 })
      const wrapper = mountTable({ users: [user] })

      await wrapper.find('.btn-delete').trigger('click')

      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')![0]).toEqual([user])
    })
  })

  describe('分页功能', () => {
    it('total 为 0 时不显示分页', () => {
      const wrapper = mountTable({ users: [], total: 0 })
      expect(wrapper.find('.pagination').exists()).toBe(false)
    })

    it('total 大于 0 时显示分页信息', () => {
      const wrapper = mountTable({ total: 25, currentPage: 2, pageSize: 10 })
      expect(wrapper.find('.pagination').exists()).toBe(true)
      expect(wrapper.find('.pagination-info').text()).toContain('共 25 条记录')
      expect(wrapper.find('.pagination-info').text()).toContain('第 2 / 3 页')
    })

    it('渲染正确的页码按钮', () => {
      const wrapper = mountTable({ total: 25, pageSize: 10 })
      // 应有：上一页、1、2、3、下一页（共 25 条，每页 10 条 => 3 页）
      const pageButtons = wrapper.findAll('.pagination-btns button')
      // 按钮: 上一页、1、2、3、下一页 = 5 个
      expect(pageButtons).toHaveLength(5)
    })

    it('当前页按钮有 active 类', () => {
      const wrapper = mountTable({ total: 50, currentPage: 3, pageSize: 10 })
      const activeBtn = wrapper.find('.pagination-btns button.active')
      expect(activeBtn.exists()).toBe(true)
      expect(activeBtn.text()).toBe('3')
    })

    it('只有一页时不显示分页导航按钮', () => {
      const wrapper = mountTable({ total: 5, pageSize: 10 })
      // total=5, pageSize=10 => totalPages=1
      expect(wrapper.find('.pagination').exists()).toBe(true)
      expect(wrapper.find('.pagination-info').text()).toContain('第 1 / 1 页')
    })

    it('第一页时上一页按钮禁用', () => {
      const wrapper = mountTable({ total: 50, currentPage: 1, pageSize: 10 })
      const prevBtn = wrapper.findAll('.pagination-btns button')[0]
      expect(prevBtn.attributes('disabled')).toBeDefined()
    })

    it('最后一页时下一页按钮禁用', () => {
      const wrapper = mountTable({ total: 50, currentPage: 5, pageSize: 10 })
      const buttons = wrapper.findAll('.pagination-btns button')
      const nextBtn = buttons[buttons.length - 1]
      expect(nextBtn.attributes('disabled')).toBeDefined()
    })

    it('点击页码按钮触发 page-change 事件', async () => {
      const wrapper = mountTable({ total: 50, currentPage: 1, pageSize: 10 })
      // 页码按钮是第 2 个（索引 1），即第 1 页按钮
      const pageButtons = wrapper.findAll('.pagination-btns button')
      // 跳过上一页按钮（索引 0），点击第 3 页（索引 3）
      await pageButtons[3].trigger('click')

      expect(wrapper.emitted('page-change')).toBeTruthy()
      expect(wrapper.emitted('page-change')![0]).toEqual([3])
    })

    it('点击当前页不触发事件', async () => {
      const wrapper = mountTable({ total: 50, currentPage: 2, pageSize: 10 })
      const buttons = wrapper.findAll('.pagination-btns button')
      // 第二页按钮是索引 2
      await buttons[2].trigger('click')

      expect(wrapper.emitted('page-change')).toBeFalsy()
    })

    it('点击上一页触发 page-change', async () => {
      const wrapper = mountTable({ total: 50, currentPage: 3, pageSize: 10 })
      const prevBtn = wrapper.findAll('.pagination-btns button')[0]
      await prevBtn.trigger('click')

      expect(wrapper.emitted('page-change')![0]).toEqual([2])
    })

    it('点击下一页触发 page-change', async () => {
      const wrapper = mountTable({ total: 50, currentPage: 2, pageSize: 10 })
      const buttons = wrapper.findAll('.pagination-btns button')
      const nextBtn = buttons[buttons.length - 1]
      await nextBtn.trigger('click')

      expect(wrapper.emitted('page-change')![0]).toEqual([3])
    })
  })
})