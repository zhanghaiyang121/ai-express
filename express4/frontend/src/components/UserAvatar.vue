<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores'

const userStore = useUserStore()

/** 弹框是否可见 */
const popupVisible = ref(false)

/** 切换弹框显示状态 */
function togglePopup() {
  popupVisible.value = !popupVisible.value
}

/** 关闭弹框 */
function closePopup() {
  popupVisible.value = false
}
</script>

<template>
  <div class="user-avatar-wrapper">
    <!-- 头像按钮 -->
    <button
      class="avatar-btn"
      :title="userStore.nickname || '用户'"
      @click="togglePopup"
    >
      <img
        v-if="userStore.avatar"
        :src="userStore.avatar"
        :alt="userStore.nickname || '用户'"
        class="avatar-img"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <span v-else class="avatar-emoji">👤</span>
    </button>

    <!-- 弹框 -->
    <Teleport to="body">
      <div
        v-if="popupVisible"
        class="avatar-popup-overlay"
        @click.self="closePopup"
      >
        <div class="avatar-popup">
          <div class="popup-header">
            <span class="popup-title">用户中心</span>
            <button class="popup-close" @click="closePopup" title="关闭">✕</button>
          </div>
          <div class="popup-body">
            <!-- 弹框内容待后续开发 -->
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
export default { name: 'UserAvatar' }
</script>

<style scoped lang="scss">
/* ========== 头像包装 ========== */
.user-avatar-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* ========== 头像按钮 ========== */
.avatar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  padding: 0;
  transition: border-color 0.2s, background-color 0.2s;
  overflow: hidden;
  flex-shrink: 0;

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.2);
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .avatar-emoji {
    font-size: 18px;
    line-height: 1;
  }
}

/* ========== 弹框遮罩 ========== */
.avatar-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
}

/* ========== 弹框 ========== */
.avatar-popup {
  position: absolute;
  top: 64px;
  right: 20px;
  width: 280px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

/* ========== 弹框头部 ========== */
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;

  .popup-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a202c;
  }

  .popup-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    background-color: transparent;
    color: #909399;
    font-size: 14px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background-color: #f2f4f7;
      color: #303133;
    }
  }
}

/* ========== 弹框内容 ========== */
.popup-body {
  min-height: 60px;
  padding: 16px;
  font-size: 13px;
  color: #909399;
}
</style>