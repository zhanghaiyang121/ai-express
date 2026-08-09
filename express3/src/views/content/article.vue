<template>
  <div class="page-container">
    <el-card>
      <template #header><div class="flex-between"><span class="page-title">文章列表</span><el-button type="primary" @click="router.push('/content/editor')">发布文章</el-button></div></template>
      <el-table :data="tableData" stripe>
        <el-table-column prop="title" label="文章标题" min-width="200" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status===1?'success':'info'" size="small">{{ row.status===1?'已发布':'草稿' }}</el-tag></template></el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="170" />
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }"><el-button link type="primary" @click="router.push('/content/editor')">编辑</el-button><el-button link type="danger">删除</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const tableData = ref([
  { id:1, title:'618大促活动攻略', category:'营销活动', status:1, createTime:'2026-08-01 10:00' },
  { id:2, title:'新品发布公告', category:'产品动态', status:0, createTime:'2026-07-28 14:30' },
  { id:3, title:'用户服务协议更新', category:'平台公告', status:1, createTime:'2026-07-15 09:00' }
])
</script>