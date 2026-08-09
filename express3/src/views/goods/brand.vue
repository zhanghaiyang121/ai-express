<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span class="page-title">品牌管理</span>
          <el-button type="primary" @click="handleAdd">新增品牌</el-button>
        </div>
      </template>
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="品牌LOGO" width="100">
          <template #default="{ row }">
            <el-avatar :size="40" shape="square" :src="row.logo" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="品牌名称" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([
  { id: 1, name: '苹果', logo: 'https://picsum.photos/40/40?random=1', sort: 1, status: 1 },
  { id: 2, name: '华为', logo: 'https://picsum.photos/40/40?random=2', sort: 2, status: 1 },
  { id: 3, name: '小米', logo: 'https://picsum.photos/40/40?random=3', sort: 3, status: 0 },
  { id: 4, name: '三星', logo: 'https://picsum.photos/40/40?random=4', sort: 4, status: 1 }
])

function handleAdd(): void { ElMessage.info('新增品牌') }
function handleEdit(row: { name: string }): void { ElMessage.info(`编辑: ${row.name}`) }
function handleDelete(row: { name: string }): void {
  ElMessageBox.confirm(`确认删除 "${row.name}"?`, '删除确认', { type: 'warning' }).then(() => ElMessage.success('删除成功'))
}
</script>