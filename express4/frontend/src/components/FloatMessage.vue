<script setup lang="ts">
import { useMessageStore } from '@/stores/message'

const messageStore = useMessageStore()

/** 图标映射 */
const iconMap: Record<string, string> = {
  success: '✓',
  warning: '⚠',
  error: '✕',
  info: 'ℹ',
}

/** 类型对应 CSS 类名 */
function typeClass(type: string): string {
  return `msg-${type}`
}
</script>

<template>
  <Teleport to="body">
    <TransitionGroup
      name="float-msg"
      tag="div"
      class="float-message-container"
    >
      <div
        v-for="msg in messageStore.messages"
        :key="msg.id"
        :class="['float-message', typeClass(msg.type)]"
        @click="messageStore.removeMessage(msg.id)"
      >
        <span class="msg-icon">{{ iconMap[msg.type] }}</span>
        <span class="msg-content">{{ msg.content }}</span>
        <button
          class="msg-close"
          @click.stop="messageStore.removeMessage(msg.id)"
          title="关闭"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped lang="scss">
.float-message-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;

  /* 确保 TransitionGroup 子元素可交互 */
  & > * {
    pointer-events: auto;
  }
}

.float-message {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 280px;
  max-width: 420px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  user-select: none;
  color: #fff;

  .msg-icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 13px;
    font-weight: 700;
    background-color: rgba(255, 255, 255, 0.25);
  }

  .msg-content {
    flex: 1;
    word-break: break-word;
  }

  .msg-close {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.15);
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s, background-color 0.2s;
    padding: 0;
    line-height: 1;

    &:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.3);
    }
  }

  /* ========== 类型颜色 ========== */
  &.msg-success {
    background-color: #67c23a;
  }

  &.msg-warning {
    background-color: #e6a23c;
  }

  &.msg-error {
    background-color: #f56c6c;
  }

  &.msg-info {
    background-color: #909399;
  }
}

/* ========== 进入/离开动画 ========== */
.float-msg-enter-active {
  transition: all 0.35s ease-out;
}

.float-msg-leave-active {
  transition: all 0.3s ease-in;
}

.float-msg-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}

.float-msg-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.85);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .float-message-container {
    top: 12px;
    right: 12px;
    left: 12px;
    gap: 8px;
  }

  .float-message {
    min-width: unset;
    max-width: unset;
  }
}
</style>