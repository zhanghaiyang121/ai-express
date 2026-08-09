<script setup lang="ts">
import { computed } from 'vue';
import type { UserInfo } from '@/types';

// ========== Props ==========
const props = withDefaults(
  defineProps<{
    users: UserInfo[];
    loading: boolean;
    total: number;
    currentPage: number;
    pageSize: number;
  }>(),
  {
    users: () => [],
    loading: false,
    total: 0,
    currentPage: 1,
    pageSize: 10,
  },
);

// ========== Emits ==========
const emit = defineEmits<{
  (e: 'page-change', page: number): void;
  (e: 'edit', user: UserInfo): void;
  (e: 'delete', user: UserInfo): void;
}>();

// ========== 计算属性 ==========
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

// ========== 方法 ==========
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page);
  }
}

function handleEdit(user: UserInfo) {
  emit('edit', user);
}

function handleDelete(user: UserInfo) {
  emit('delete', user);
}

/** 根据角色返回标签样式类名 */
function roleClass(role: string): string {
  const map: Record<string, string> = {
    admin: 'role-admin',
    editor: 'role-editor',
    viewer: 'role-user',
  };
  return map[role] || 'role-user';
}

/** 角色中文映射 */
function roleLabel(role: string): string {
  const map: Record<string, string> = {
    admin: '管理员',
    editor: '编辑者',
    viewer: '观察者',
  };
  return map[role] || role;
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
export default { name: 'UserTable' };
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.user-table-wrapper {
  background-color: var(--bg-surface);
  border-radius: var(--radius-base);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table-loading,
.table-empty {
  padding: 60px 0;
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;
}

/* ========== 表格 ========== */
.user-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: $bg-color;

    th {
      padding: 12px var(--gap-md);
      font-size: var(--font-size-body);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      text-align: left;
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
    }
  }

  tbody td {
    padding: 12px var(--gap-md);
    font-size: var(--font-size-body);
    color: var(--text-normal);
    border-bottom: 1px solid var(--border-color-light);
    height: 48px;
  }

  tbody tr:hover {
    background-color: var(--bg-hover);
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
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);

  &.role-admin {
    background-color: var(--color-info-bg);
    color: var(--color-info);
  }

  &.role-editor {
    background-color: var(--color-warning-bg);
    color: var(--color-warning);
  }

  &.role-user {
    background-color: var(--color-success-bg);
    color: var(--color-success);
  }
}

/* ========== 操作按钮 ========== */
.btn-edit,
.btn-delete {
  padding: var(--gap-xs) var(--gap-sm);
  font-size: var(--font-size-caption);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    opacity: 0.85;
  }
}

.btn-edit {
  color: $primary-color;
  border-color: $primary-color;
  background-color: transparent;
  margin-right: var(--gap-sm);

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
  padding: var(--gap-md);
  border-top: 1px solid var(--border-color-light);
  flex-wrap: wrap;
  gap: var(--gap-sm);
}

.pagination-info {
  font-size: var(--font-size-caption);
  color: var(--text-secondary);
}

.pagination-btns {
  display: flex;
  align-items: center;
  gap: var(--gap-xs);

  button {
    min-width: 36px;
    height: 36px;
    padding: 0 10px;
    font-size: var(--font-size-caption);
    color: var(--text-normal);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background-color: var(--bg-surface);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }

    &:disabled {
      color: var(--color-success);
      cursor: not-allowed;
      opacity: 0.5;
    }

    &.active {
      background-color: $primary-color;
      color: #fff;
      border-color: $primary-color;
    }
  }
}
</style>