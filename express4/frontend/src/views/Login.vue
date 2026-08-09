<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore, useAppStore } from '@/stores';
import type { LoginParams } from '@/types';

const router = useRouter();
const userStore = useUserStore();
const appStore = useAppStore();

appStore.setPageTitle('登录');

const loginForm = reactive<LoginParams>({
  username: '',
  password: '',
});
const loading = ref(false);
const errorMsg = ref('');

async function handleLogin() {
  if (!loginForm.username.trim() || !loginForm.password.trim()) {
    errorMsg.value = '请输入用户名和密码';
    return;
  }

  loading.value = true;
  errorMsg.value = '';

  try {
    await userStore.login(loginForm);
    router.push('/');
  } catch (e: unknown) {
    const err = e as { message?: string };
    errorMsg.value = err.message || '登录失败';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>用户登录</h1>
      <form class="login-form" @submit.prevent="handleLogin">
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
@use '@/styles/variables.scss' as *;

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
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);

  h1 {
    text-align: center;
    font-size: var(--font-size-h1);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    margin-bottom: var(--gap-xl);
  }
}

.login-form {
  .form-item {
    margin-bottom: var(--gap-lg);

    label {
      display: block;
      margin-bottom: 6px;
      font-size: var(--font-size-body);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
    }

    input {
      width: 100%;
      padding: 10px 14px;
      font-size: var(--font-size-body);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      background-color: var(--bg-surface);
      color: var(--text-primary);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

      &::placeholder {
        color: var(--text-placeholder);
      }

      &:focus {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px var(--color-primary-bg);
      }
    }
  }

  .error-msg {
    color: $danger-color;
    font-size: var(--font-size-caption);
    margin-bottom: var(--gap-md);
    text-align: center;
  }

  .btn-submit {
    width: 100%;
    padding: 12px;
    font-size: var(--font-size-h3);
    font-weight: var(--font-weight-medium);
    color: #fff;
    background-color: $primary-color;
    border-radius: var(--radius-sm);
    transition: background-color var(--transition-fast);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-hover);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.back-link {
  margin-top: var(--gap-lg);
  text-align: center;
  font-size: var(--font-size-caption);

  a {
    color: var(--text-secondary);

    &:hover {
      color: $primary-color;
    }
  }
}
</style>