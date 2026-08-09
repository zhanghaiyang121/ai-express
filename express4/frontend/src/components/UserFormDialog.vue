<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { UserInfo } from '@/types';
import { useUserManagementStore } from '@/stores';

// ========== Props ==========
const props = withDefaults(
  defineProps<{
    visible: boolean;
    user: UserInfo | null;
  }>(),
  {
    visible: false,
    user: null,
  },
);

// ========== Emits ==========
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit-success'): void;
}>();

// ========== Store ==========
const store = useUserManagementStore();

// ========== 计算属性 ==========
const isEditMode = computed(() => props.user !== null);
const dialogTitle = computed(() => (isEditMode.value ? '编辑用户' : '新建用户'));

// ========== 表单数据 ==========
const formData = ref({
  username: '',
  nickname: '',
  email: '',
  role: 'user',
  password: '',
});

const errors = ref<Record<string, string>>({});
const submitting = ref(false);

// ========== 监听 visible 变化，初始化/重置表单 ==========
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      if (props.user) {
        formData.value = {
          username: props.user.username,
          nickname: props.user.nickname,
          email: props.user.email,
          role: props.user.role,
          password: '',
        };
      } else {
        formData.value = {
          username: '',
          nickname: '',
          email: '',
          role: 'user',
          password: '',
        };
      }
      errors.value = {};
    }
  },
  { immediate: true },
);

// ========== 表单验证 ==========
function validate(): boolean {
  const errs: Record<string, string> = {};

  if (!formData.value.username) {
    errs.username = '用户名不能为空';
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.value.username)) {
    errs.username = '用户名需3-20位，仅限字母数字下划线';
  }

  if (!formData.value.nickname) {
    errs.nickname = '昵称不能为空';
  } else if (formData.value.nickname.length > 20) {
    errs.nickname = '昵称不超过20个字符';
  }

  if (!formData.value.email) {
    errs.email = '邮箱不能为空';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errs.email = '请输入有效的邮箱格式';
  }

  if (!isEditMode.value) {
    if (!formData.value.password) {
      errs.password = '密码不能为空';
    } else if (formData.value.password.length < 6 || formData.value.password.length > 20) {
      errs.password = '密码需6-20位';
    }
  }

  if (!formData.value.role) {
    errs.role = '请选择角色';
  }

  errors.value = errs;
  return Object.keys(errs).length === 0;
}

// ========== 提交表单 ==========
async function handleSubmit() {
  if (!validate()) return;

  submitting.value = true;
  try {
    if (isEditMode.value && props.user) {
      const success = await store.updateUser(props.user.id, {
        nickname: formData.value.nickname,
        email: formData.value.email,
        role: formData.value.role,
      });
      if (success) {
        emit('submit-success');
        emit('close');
      }
    } else {
      const { Msg } = await import('@/stores/message');
      Msg.info('创建用户功能需要后端 API 支持');
    }
  } finally {
    submitting.value = false;
  }
}

// ========== 关闭弹窗 ==========
function handleClose() {
  emit('close');
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
            <option value="viewer">观察者</option>
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
export default { name: 'UserFormDialog' };
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

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
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ========== 标题栏 ========== */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--gap-lg) var(--gap-lg) var(--gap-md);
  border-bottom: 1px solid var(--border-color-light);
}

.dialog-title {
  font-size: 17px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast), color var(--transition-fast);

  &:hover {
    background-color: #f2f4f7;
    color: var(--text-primary);
  }
}

/* ========== 表单区域 ========== */
.dialog-body {
  padding: var(--gap-lg) var(--gap-lg);
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
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);

  .required {
    color: $danger-color;
    margin-left: 2px;
  }
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  font-size: var(--font-size-body);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: $primary-color;
    box-shadow: 0 0 0 2px var(--color-primary-bg);
  }

  &:disabled {
    background-color: $bg-color;
    color: var(--text-secondary);
    cursor: not-allowed;
  }

  &.input-error {
    border-color: $danger-color;

    &:focus {
      box-shadow: 0 0 0 2px var(--color-danger-bg);
    }
  }
}

select.form-input {
  cursor: pointer;
}

.error-text {
  margin: var(--gap-xs) 0 0;
  font-size: 12px;
  color: $danger-color;
}

/* ========== 底部按钮 ========== */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--gap-sm);
  padding: var(--gap-md) var(--gap-lg) var(--gap-lg);
  border-top: 1px solid var(--border-color-light);
}

.btn-cancel,
.btn-submit {
  padding: var(--gap-sm) var(--gap-lg);
  font-size: var(--font-size-body);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cancel {
  color: var(--text-normal);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);

  &:hover {
    background-color: $bg-color;
  }
}

.btn-submit {
  color: #fff;
  background-color: $primary-color;
  border: 1px solid $primary-color;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>