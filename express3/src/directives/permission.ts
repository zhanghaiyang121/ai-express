/**
 * v-permission 权限指令
 * 职责：按钮级权限控制，无权限则隐藏元素
 * 使用：<el-button v-permission="'goods:publish'">发布</el-button>
 */
import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    const { value } = binding
    if (!value) return

    const userStore = useUserStore()
    if (!userStore.hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

export default permission