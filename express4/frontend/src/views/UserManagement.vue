<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserManagementStore } from '@/stores'
import type { UserInfo } from '@/types'
import UserTable from '@/components/UserTable.vue'
import UserFormDialog from '@/components/UserFormDialog.vue'
import UserDeleteConfirm from '@/components/UserDeleteConfirm.vue'

// ========== Store ==========
const store = useUserManagementStore()

// ========== 弹窗状态 ==========
const formDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingUser = ref<UserInfo | null>(null)
const deletingUser = ref<UserInfo | null>(null)

// ========== 初始化加载 ==========
onMounted(() => {
  store.fetchUserList()
})

// ========== 分页变更 ==========
function handlePageChange(page: number) {
  store.fetchUserList(page)
}

// ========== 编辑用户 ==========
function handleEdit(user: UserInfo) {
  editingUser.value = user
  formDialogVisible.value = true
}

// ========== 删除用户 ==========
function handleDelete(user: UserInfo) {
  deletingUser.value = user
  deleteDialogVisible.value = true
}

// ========== 新建用户 ==========
function handleCreate() {
  editingUser.value = null
  formDialogVisible.value = true
}

// ========== 表单弹窗关闭 ==========
function handleFormClose() {
  formDialogVisible.value = false
  editingUser.value = null
}

// ========== 表单提交成功 ==========
function handleFormSuccess() {
  formDialogVisible.value = false
  editingUser.value = null
  store.fetchUserList()
}

// ========== 删除弹窗关闭 ==========
function handleDeleteClose() {
  deleteDialogVisible.value = false
  deletingUser.value = null
}

// ========== 确认删除 ==========
async function handleDeleteConfirm(user: UserInfo) {
  const success = await store.deleteUser(user.id)
  deleteDialogVisible.value = false
  deletingUser.value = null
  if (success) {
    store.fetchUserList()
  }
}
</script>

<template>
  <div class="user-management-page">
    <!-- ========== 页面标题 ========== -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <button class="btn-create" @click="handleCreate">+ 新建用户</button>
    </div>

    <!-- ========== 用户表格 ========== -->
    <UserTable
      :users="store.list"
      :loading="store.loading"
      :total="store.total"
      :current-page="store.currentPage"
      :page-size="store.pageSize"
      @page-change="handlePageChange"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- ========== 创建/编辑弹窗 ========== -->
    <UserFormDialog
      :visible="formDialogVisible"
      :user="editingUser"
      @close="handleFormClose"
      @submit-success="handleFormSuccess"
    />

    <!-- ========== 删除确认弹窗 ========== -->
    <UserDeleteConfirm
      :visible="deleteDialogVisible"
      :user="deletingUser"
      @close="handleDeleteClose"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script lang="ts">
export default { name: 'UserManagement' }
</script>

<style scoped lang="scss">
.user-management-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* ========== 页面标题区域 ========== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.btn-create {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background-color: $primary-color;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: color-mix(in srgb, $primary-color, #000 10%);
  }
}
</style>