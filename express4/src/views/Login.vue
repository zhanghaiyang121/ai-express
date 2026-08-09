<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useAppStore } from '@/stores'
import type { LoginParams } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

appStore.setPageTitle('登录')

const formRef = ref<HTMLFormElement>()
const loginForm = reactive<LoginParams>({
  username: '',
  password: ''
})
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!loginForm.username.trim() || !loginForm.password.trim()) {
    errorMsg.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    await userStore.login(loginForm)
    router.push('/')
  } catch (e: any) {
    errorMsg.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>用户登录</h1>
      <form ref="formRef" class="login-form" @submit.prevent="handleLogin">
        <div class="form-item">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>
        <div class="form-item">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>
        <div v-if="errorMsg" class="error-msg">
          {{ errorMsg }}
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>
      <p class="back-link">
        <router-link to="/">← 返回首页</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: $bg-color-white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);

  h1 {
    text-align: center;
    font-size: 24px;
    color: $text-primary;
    margin-bottom: 32px;
  }
}

.login-form {
  .form-item {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 6px;
      font-size: 14px;
      color: $text-regular;
    }

    input {
      width: 100%;
      padding: 10px 14px;
      font-size: 14px;
      border: 1px solid $border-color-base;
      border-radius: 6px;
      transition: border-color 0.3s;

      &:focus {
        border-color: $primary-color;
      }
    }
  }

  .error-msg {
    color: $danger-color;
    font-size: 13px;
    margin-bottom: 16px;
    text-align: center;
  }

  .btn-submit {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    color: #fff;
    background-color: $primary-color;
    border-radius: 6px;
    transition: background-color 0.3s;

    &:hover:not(:disabled) {
        background-color: color-mix(in srgb, $primary-color, #000 10%);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.back-link {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;

  a {
    color: $text-secondary;

    &:hover {
      color: $primary-color;
    }
  }
}
</style>