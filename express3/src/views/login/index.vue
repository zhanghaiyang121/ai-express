<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">电商后台管理系统</h1>
        <p class="login-desc">欢迎回来，请登录您的账号</p>
      </div>

      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        size="large"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="captcha" class="captcha-item">
          <el-input
            v-model="loginForm.captcha"
            placeholder="请输入验证码"
            :prefix-icon="Key"
          />
          <div class="captcha-img" @click="refreshCaptcha">
            <span class="captcha-text">{{ captchaText }}</span>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>

        <div class="login-extra">
          <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
          <router-link to="/forgot-password" class="forgot-link">
            忘记密码？
          </router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import type { LoginParams } from '@/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)

/** 登录表单数据 */
const loginForm = reactive<LoginParams>({
  username: 'admin',
  password: 'admin123',
  captcha: ''
})

/** 表单校验规则 */
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2到20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度在6到30个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度为4位', trigger: 'blur' }
  ]
}

/** 模拟验证码 */
const captchaText = ref(generateCaptcha())

/** 生成随机验证码 */
function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/** 刷新验证码 */
function refreshCaptcha(): void {
  captchaText.value = generateCaptcha()
}

/** 处理登录 */
async function handleLogin(): Promise<void> {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 简单验证码校验
    if (loginForm.captcha.toUpperCase() !== captchaText.value) {
      ElMessage.error('验证码错误')
      refreshCaptcha()
      return
    }

    loading.value = true
    try {
      await userStore.login(loginForm)
      permissionStore.generateRoutes()

      ElMessage.success('登录成功')
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } catch {
      ElMessage.error('登录失败，请重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  padding: 40px;
  background: $color-white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.login-header {
  margin-bottom: 32px;
  text-align: center;

  .login-title {
    font-size: 24px;
    font-weight: 700;
    color: $color-text-primary;
    margin-bottom: 8px;
  }

  .login-desc {
    font-size: $font-size-base;
    color: $color-text-secondary;
  }
}

.login-form {
  .captcha-item {
    :deep(.el-form-item__content) {
      display: flex;
      gap: 12px;
    }
  }

  .captcha-img {
    flex-shrink: 0;
    width: 110px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f2f5;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;

    .captcha-text {
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #5e5ce6;
      font-family: 'Courier New', monospace;
    }
  }

  .login-btn {
    width: 100%;
  }
}

.login-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .forgot-link {
    font-size: $font-size-small;
    color: $color-info;

    &:hover {
      color: $color-primary;
    }
  }
}
</style>