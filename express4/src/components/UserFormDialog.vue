<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { UserInfo } from '@/types'
import { useUserManagementStore } from '@/stores'

// ========== Props ==========
const props = withDefaults(
  defineProps<{
    visible: boolean
    user: UserInfo | null
  }>(),
  {
    visible: false,
    user: null,
  },
)

// ========== Emits ==========
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit-success'): void
}>()

// ========== Store ==========
const store = useUserManagementStore()

// ========== 计算属性 ==========
const isEditMode = computed(() => props.user !== null)
const dialogTitle = computed(() => (isEditMode.value ? '编辑用户' : '新建用户'))

// ========== 表单数据 ==========
const formData = ref({
  username: '',
  nickname: '',
  email: '',
  role: 'user',
  password: '',
})

const errors = ref<Record<string, string>>({})
const submitting = ref(false)

// ========== 监听 visible 变化，初始化/重置表单 ==========
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.user) {
        // 编辑模式：回显数据
        formData.value = {
          username: props.user.username,
          nickname: props.user.nickname,
          email: props.user.email,
          role: props.user.role,
          password: '',
        }
      } else {
        // 创建模式：重置
        formData.value = {
          username: '',
          nickname: '',
          email: '',
          role: 'user',
          password: '',
        }
      }
      errors.value = {}
    }
  },
)

// ========== 表单验证 ==========
function validate(): boolean {
  const errs: Record<string, string> = {}

  // 用户名验证
  if (!formData.value.username) {
    errs.username = '用户名不能为空'
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.value.username)) {
    errs.username = '用户名需3-20位，仅限字母数字下划线'
  }

  // 昵称验证
  if (!formData.value.nickname) {
    errs.nickname = '昵称不能为空'
  } else if (formData.value.nickname.length > 20) {
    errs.nickname = '昵称不超过20个字符'
  }

  // 邮箱验证
  if (!formData.value.email) {
    errs.email = '邮箱不能为空'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errs.email = '请输入有效的邮箱格式'
  }

  // 密码验证（创建模式必填）
  if (!isEditMode.value) {
    if (!formData.value.password) {
      errs.password = '密码不能为空'
    } else if (formData.value.password.length < 6 || formData.value.password.length > 20) {
      errs.password = '密码需6-20位'
    }
  }

  // 角色验证
  if (!formData.value.role) {
    errs.role = '请选择角色'
  }

  errors.value = errs
  return Object.keys(errs).length === 0
}

// ========== 提交表单 ==========
async function handleSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    if (isEditMode.value && props.user) {
      // 编辑模式
      const success = await store.updateUser(props.user.id, {
        nickname: formData.value.nickname,
        email: formData.value.email,
        role: formData.value.role,
      })
      if (success) {
        emit('submit-success')
        emit('close')
      }
    } else {
      // 创建模式：通过 store 调用 API
      // 注意：userApi 当前只有 getUserList/updateUser/deleteUser，创建用户需要额外的 API
      // 这里使用 Msg 提示需要后端支持创建 API
      const { Msg } = await import('@/stores/message')
      Msg.info('创建用户功能需要后端 API 支持')
    }
  } finally {
    submitting.value = false
  }
}

// ========== 关闭弹窗 ==========
function handleClose() {
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
    <div class="dialog-container">
      <!-- 标题栏 -->
      <div class="dialog-header">
        <h3 class="dialog-title">{{ dialogTitle }}</h3>
        <button class="btn-close" @click="handleClose">&times;</button>
      </div>

      <!-- 表单内容 -->
      <form class="dialog-body" @submit.prevent="handleSubmit">
        <!-- 用户名 -->
        <div class="form-group">
          <label class="form-label">
            用户名
            <span v-if="!isEditMode" class="required">*</span>
          </label>
          <input
            v-model="formData.username"
            type="text"
            class="form-input"
            :class="{ 'input-error': errors.username }"
            :disabled="isEditMode"
            placeholder="请输入用户名（3-20位字母数字下划线）"
          />
          <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
        </div>

        <!-- 昵称 -->
        <div class="form-group">
          <label class="form-label">
            昵称
            <span class="required">*</span>
          </label>
          <input
            v-model="formData.nickname"
            type="text"
            class="form-input"
            :class="{ 'input-error': errors.nickname }"
            placeholder="请输入昵称（1-20字符）"
          />
          <p v-if="errors.nickname" class="error-text">{{ errors.nickname }}</p>
        </div>

        <!-- 邮箱 -->
        <div class="form-group">
          <label class="form-label">
            邮箱
            <span class="required">*</span>
          </label>
          <input
            v-model="formData.email"
            type="email"
            class="form-input"
            :class="{ 'input-error': errors.email }"
            placeholder="请输入邮箱地址"
          />
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
        </div>

        <!-- 角色 -->
        <div class="form-group">
          <label class="form-label">
            角色
            <span class="required">*</span>
          </label>
          <select v-model="formData.role" class="form-input" :class="{ 'input-error': errors.role }">
            <option value="admin">管理员</option>
            <option value="editor">编辑者</option>
            <option value="user">普通用户</option>
          </select>
          <p v-if="errors.role" class="error-text">{{ errors.role }}</p>
        </div>

        <!-- 密码（仅创建模式显示） -->
        <div v-if="!isEditMode" class="form-group">
          <label class="form-label">
            密码
            <span class="required">*</span>
          </label>
          <input
            v-model="formData.password"
            type="password"
            class="form-input"
            :class="{ 'input-error': errors.password }"
            placeholder="请输入密码（6-20位）"
          />
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        </div>
      </form>

      <!-- 底部按钮 -->
      <div class="dialog-footer">
        <button class="btn-cancel" @click="handleClose">取消</button>
        <button class="btn-submit" :disabled="submitting" @click="handleSubmit">
          {{ submitting ? '提交中...' : (isEditMode ? '保存' : '创建') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default { name: 'UserFormDialog' }
</script>

<style scoped lang="scss">
/* ========== 遮罩层 ========== */
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.45);
}

/* ========== 弹窗容器 ========== */
.dialog-container {
  width: 460px;
  max-width: 90vw;
  max-height: 85vh;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ========== 标题栏 ========== */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.dialog-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #8b95a5;
  border-radius: 6px;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #f2f4f7;
    color: #1a202c;
  }
}

/* ========== 表单区域 ========== */
.dialog-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 18px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;

  .required {
    color: $danger-color;
    margin-left: 2px;
  }
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  color: #1a202c;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
  }

  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  &.input-error {
    border-color: $danger-color;

    &:focus {
      box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.15);
    }
  }
}

select.form-input {
  cursor: pointer;
}

.error-text {
  margin: 4px 0 0;
  font-size: 12px;
  color: $danger-color;
}

/* ========== 底部按钮 ========== */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid #f0f2f5;
}

.btn-cancel,
.btn-submit {
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.btn-cancel {
  color: #4a5568;
  background-color: #fff;
  border: 1px solid #d1d5db;

  &:hover {
    background-color: #f2f4f7;
  }
}

.btn-submit {
  color: #fff;
  background-color: $primary-color;
  border: 1px solid $primary-color;

  &:hover:not(:disabled) {
    background-color: color-mix(in srgb, $primary-color, #000 10%);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>