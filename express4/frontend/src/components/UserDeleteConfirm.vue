<script setup lang="ts">
import type { UserInfo } from '@/types';

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
  (e: 'confirm', user: UserInfo): void;
}>();

// ========== 方法 ==========
function handleClose() {
  emit('close');
}

function handleConfirm() {
  if (props.user) {
    emit('confirm', props.user);
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
export default { name: 'UserDeleteConfirm' };
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
.confirm-dialog {
  width: 400px;
  max-width: 90vw;
  padding: var(--gap-xl) 28px var(--gap-lg);
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  text-align: center;
}

/* ========== 图标 ========== */
.confirm-icon {
  font-size: 44px;
  margin-bottom: var(--gap-md);
}

/* ========== 标题 ========== */
.confirm-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--gap-sm);
}

/* ========== 内容 ========== */
.confirm-content {
  font-size: var(--font-size-body);
  color: var(--text-normal);
  line-height: 1.6;
  margin: 0 0 var(--gap-lg);

  strong {
    color: var(--text-primary);
  }
}

/* ========== 按钮 ========== */
.confirm-actions {
  display: flex;
  justify-content: center;
  gap: var(--gap-sm);
}

.btn-cancel,
.btn-confirm {
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

.btn-confirm {
  color: #fff;
  background-color: $danger-color;
  border: 1px solid $danger-color;

  &:hover {
    background-color: #d43a3a;
  }
}
</style>