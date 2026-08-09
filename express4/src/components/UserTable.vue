<script setup lang="ts">
import { computed } from 'vue'
import type { UserInfo } from '@/types'

// ========== Props ==========
const props = withDefaults(
  defineProps<{
    users: UserInfo[]
    loading: boolean
    total: number
    currentPage: number
    pageSize: number
  }>(),
  {
    users: () => [],
    loading: false,
    total: 0,
    currentPage: 1,
    pageSize: 10,
  },
)

// ========== Emits ==========
const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'edit', user: UserInfo): void
  (e: 'delete', user: UserInfo): void
}>()

// ========== 计算属性 ==========
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

// ========== 方法 ==========
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page)
  }
}

function handleEdit(user: UserInfo) {
  emit('edit', user)
}

function handleDelete(user: UserInfo) {
  emit('delete', user)
}

/** 根据角色返回标签样式类名 */
function roleClass(role: string): string {
  const map: Record<string, string> = {
    admin: 'role-admin',
    editor: 'role-editor',
  }
  return map[role] || 'role-user'
}

/** 角色中文映射 */
function roleLabel(role: string): string {
  const map: Record<string, string> = {
    admin: '管理员',
    editor: '编辑者',
    user: '普通用户',
  }
  return map[role] || role
}
</script>

<template>
  <div class="user-table-wrapper">
    <!-- ========== 加载状态 ========== -->
    <div v-if="loading" class="table-loading">加载中...</div>

    <!-- ========== 空状态 ========== -->
    <div v-else-if="users.length === 0" class="table-empty">暂无用户数据</div>

    <!-- ========== 数据表格 ========== -->
    <table v-else class="user-table">
      <thead>
        <tr>
          <th class="col-id">ID</th>
          <th class="col-username">用户名</th>
          <th class="col-nickname">昵称</th>
          <th class="col-email">邮箱</th>
          <th class="col-role">角色</th>
          <th class="col-actions">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td class="col-id">{{ user.id }}</td>
          <td class="col-username">{{ user.username }}</td>
          <td class="col-nickname">{{ user.nickname }}</td>
          <td class="col-email">{{ user.email }}</td>
          <td class="col-role">
            <span class="role-tag" :class="roleClass(user.role)">
              {{ roleLabel(user.role) }}
            </span>
          </td>
          <td class="col-actions">
            <button class="btn-edit" @click="handleEdit(user)">编辑</button>
            <button class="btn-delete" @click="handleDelete(user)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ========== 分页 ========== -->
    <div v-if="total > 0" class="pagination">
      <span class="pagination-info">共 {{ total }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页</span>
      <div class="pagination-btns">
        <button :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">上一页</button>

        <button
          v-for="p in totalPages"
          :key="p"
          :class="{ active: p === currentPage }"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>

        <button :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default { name: 'UserTable' }
</script>

<style scoped lang="scss">
.user-table-wrapper {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.table-loading,
.table-empty {
  padding: 60px 0;
  text-align: center;
  color: #8b95a5;
  font-size: 15px;
}

/* ========== 表格 ========== */
.user-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: #f7f8fa;

    th {
      padding: 14px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #4a5568;
      text-align: left;
      border-bottom: 1px solid #e8ecf1;
      white-space: nowrap;
    }
  }

  tbody td {
    padding: 14px 16px;
    font-size: 14px;
    color: #2d3748;
    border-bottom: 1px solid #f0f2f5;
  }

  tbody tr:hover {
    background-color: #f7f9fc;
  }
}

.col-id {
  width: 80px;
}

.col-role {
  width: 100px;
}

.col-actions {
  width: 150px;
}

/* ========== 角色标签 ========== */
.role-tag {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 10px;
  font-weight: 500;

  &.role-admin {
    background-color: #ebf5ff;
    color: #3182ce;
  }

  &.role-editor {
    background-color: #fef3e2;
    color: #dd6b20;
  }

  &.role-user {
    background-color: #e8f5e9;
    color: #388e3c;
  }
}

/* ========== 操作按钮 ========== */
.btn-edit,
.btn-delete {
  padding: 4px 12px;
  font-size: 13px;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;

  &:hover {
    opacity: 0.85;
  }
}

.btn-edit {
  color: $primary-color;
  border-color: $primary-color;
  background-color: transparent;
  margin-right: 8px;

  &:hover {
    background-color: $primary-color;
    color: #fff;
  }
}

.btn-delete {
  color: $danger-color;
  border-color: $danger-color;
  background-color: transparent;

  &:hover {
    background-color: $danger-color;
    color: #fff;
  }
}

/* ========== 分页 ========== */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid #f0f2f5;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-info {
  font-size: 13px;
  color: #8b95a5;
}

.pagination-btns {
  display: flex;
  align-items: center;
  gap: 4px;

  button {
    min-width: 36px;
    height: 36px;
    padding: 0 10px;
    font-size: 13px;
    color: #4a5568;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }

    &:disabled {
      color: #ccc;
      cursor: not-allowed;
    }

    &.active {
      background-color: $primary-color;
      color: #fff;
      border-color: $primary-color;
    }
  }
}
</style>