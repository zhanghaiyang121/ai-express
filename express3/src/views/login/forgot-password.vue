<template>
  <div class="forgot-container">
    <div class="forgot-card">
      <div class="forgot-header"><h1>找回密码</h1><p>通过手机号找回您的账号密码</p></div>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" size="large">
        <el-form-item prop="account"><el-input v-model="form.account" placeholder="请输入手机号或邮箱" /></el-form-item>
        <el-form-item prop="code">
          <el-input v-model="form.code" placeholder="请输入验证码">
            <template #append><el-button :disabled="countdown>0" @click="sendCode">{{ countdown>0?countdown+'s':'获取验证码' }}</el-button></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="newPassword"><el-input v-model="form.newPassword" type="password" placeholder="请输入新密码" show-password /></el-form-item>
        <el-form-item><el-button type="primary" class="w-full" :loading="loading" @click="handleSubmit">重置密码</el-button></el-form-item>
        <div class="text-center"><router-link to="/login">返回登录</router-link></div>
      </el-form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const countdown = ref(0)
const form = reactive({ account:'', code:'', newPassword:'' })
const rules: FormRules = {
  account:[{ required:true, message:'请输入手机号或邮箱', trigger:'blur' }],
  code:[{ required:true, message:'请输入验证码', trigger:'blur' }],
  newPassword:[{ required:true, message:'请输入新密码', trigger:'blur' },{ min:6, max:30, message:'密码长度6-30位', trigger:'blur' }]
}
function sendCode():void { if(!form.account){ ElMessage.warning('请先输入手机号或邮箱'); return } countdown.value=60; const t=setInterval(()=>{ countdown.value--; if(countdown.value<=0)clearInterval(t) },1000); ElMessage.success('验证码已发送') }
async function handleSubmit():Promise<void> { if(!formRef.value)return; await formRef.value.validate(async valid=>{ if(!valid)return; loading.value=true; await new Promise(r=>setTimeout(r,1000)); ElMessage.success('密码重置成功'); router.push('/login'); loading.value=false }) }
</script>
<style scoped>
.forgot-container { display:flex; align-items:center; justify-content:center; min-height:100vh; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); }
.forgot-card { width:420px; padding:40px; background:#fff; border-radius:8px; box-shadow:0 8px 32px rgba(0,0,0,0.15); }
.forgot-header { margin-bottom:32px; text-align:center; }
.forgot-header h1{ font-size:24px; font-weight:700; color:#303133; margin-bottom:8px; }
.forgot-header p{ font-size:14px; color:#909399; }
</style>