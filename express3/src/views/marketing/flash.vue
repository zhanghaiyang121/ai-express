<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span class="page-title">秒杀活动</span>
          <el-button type="primary" @click="handleAdd">创建秒杀</el-button>
        </div>
      </template>
      <el-table :data="tableData" stripe>
        <el-table-column prop="name" label="活动名称" />
        <el-table-column prop="timeSlot" label="时段" width="200" />
        <el-table-column prop="goods" label="秒杀商品" min-width="150" />
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status===1?'warning':'info'" size="small">{{ row.status===1?'即将开始':'已结束' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const tableData = ref([
  { id:1, name:'整点秒杀', timeSlot:'每天 10:00 / 15:00 / 20:00', goods:'iPhone 15 Pro限时抢', stock:100, status:1 },
  { id:2, name:'周末秒杀', timeSlot:'周六日 12:00', goods:'AirPods Pro特价', stock:200, status:0 }
])
function handleAdd(): void { ElMessage.info('创建秒杀') }
function handleEdit(row: { name: string }): void { ElMessage.info('编辑: ' + row.name) }
</script>