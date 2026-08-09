<script setup lang="ts">
import type { UserInfo } from '@/types'

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
  (e: 'confirm', user: UserInfo): void
}>()

// ========== 方法 ==========
function handleClose() {
  emit('close')
}

function handleConfirm() {
  if (props.user) {
    emit('confirm', props.user)
  }
}
</script>

<template>
  <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
    <div class="confirm-dialog">
      <!-- 图标 -->
      <div class="confirm-icon">⚠️</div>

      <!-- 标题 -->
      <h3 class="confirm-title">确认删除用户</h3>

      <!-- 内容 -->
      <p class="confirm-content" v-if="user">
        确定要删除用户 <strong>{{ user.username }}</strong>（{{ user.nickname }}）吗？此操作不可撤销。
      </p>

      <!-- 按钮 -->
      <div class="confirm-actions">
        <button class="btn-cancel" @click="handleClose">取消</button>
        <button class="btn-confirm" @click="handleConfirm">确认删除</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default { name: 'UserDeleteConfirm' }
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
.confirm-dialog {
  width: 400px;
  max-width: 90vw;
  padding: 32px 28px 24px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  text-align: center;
}

/* ========== 图标 ========== */
.confirm-icon {
  font-size: 44px;
  margin-bottom: 16px;
}

/* ========== 标题 ========== */
.confirm-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 12px;
}

/* ========== 内容 ========== */
.confirm-content {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 24px;

  strong {
    color: #1a202c;
  }
}

/* ========== 按钮 ========== */
.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-cancel,
.btn-confirm {
  padding: 8px 24px;
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

.btn-confirm {
  color: #fff;
  background-color: $danger-color;
  border: 1px solid $danger-color;

  &:hover {
    background-color: color-mix(in srgb, $danger-color, #000 12%);
  }
}
</style>