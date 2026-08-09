<template>
  <div class="header-container">
    <div class="header-left">
      <el-icon class="collapse-btn" :size="22" @click="appStore.toggleSidebar()">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path" :to="item.path">{{item.title}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <el-badge :value="3" class="header-notice">
        <el-icon :size="20"><Bell /></el-icon>
      </el-badge>
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" icon="UserFilled" />
          <span class="username">{{userStore.username}}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile"><el-icon><User /></el-icon>个人中心</el-dropdown-item>
            <el-dropdown-item command="password"><el-icon><Lock /></el-icon>修改密码</el-dropdown-item>
            <el-dropdown-item divided command="logout"><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { Fold, Expand, Bell, ArrowDown, User, Lock, SwitchButton } from '@element-plus/icons-vue'
const route = useRoute(); const router = useRouter()
const appStore = useAppStore(); const userStore = useUserStore()
const breadcrumbList = computed(()=>route.matched.filter(i=>i.meta?.title).map(i=>({title:i.meta.title as string,path:i.path})))
function handleCommand(cmd:string):void { if(cmd==='logout'){userStore.logout();router.push('/login')} }
</script>
<style scoped>
.header-container { display:flex; align-items:center; justify-content:space-between; height:60px; padding:0 16px; background:#fff; border-bottom:1px solid #E4E7ED; }
.header-left { display:flex; align-items:center; gap:12px; }
.collapse-btn { cursor:pointer; color:#606266; }
.collapse-btn:hover { color:#409EFF; }
.header-right { display:flex; align-items:center; gap:20px; }
.header-notice { cursor:pointer; }
.user-info { display:flex; align-items:center; gap:8px; cursor:pointer; }
.username { font-size:14px; color:#303133; }
</style>