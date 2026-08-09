<template>
  <div class="page-container">
    <el-card>
      <el-form :model="query" inline class="search-form">
        <el-form-item label="用户昵称">
          <el-input v-model="query.keyword" placeholder="昵称/手机号/ID" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker v-model="query.dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width:240px" />
        </el-form-item>
        <el-form-item label="用户等级">
          <el-select v-model="query.level" placeholder="全部" clearable style="width:140px">
            <el-option label="普通会员" :value="1" />
            <el-option label="银卡会员" :value="2" />
            <el-option label="金卡会员" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="36" :src="row.avatar" />
              <div>
                <span class="user-name">{{ row.nickname }}</span>
                <br /><span class="user-phone">{{ row.phone }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="100">
          <template #default="{ row }">
            <el-tag :type="row.level === 3 ? 'warning' : row.level === 2 ? '' : 'info'" size="small">
              {{ ['','普通','银卡','金卡'][row.level] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="消费金额" width="120" align="center">
          <template #default="{ row }">¥{{ row.totalAmount.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="80" align="center" />
        <el-table-column prop="regTime" label="注册时间" width="170" />
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push('/user/detail/' + row.id)">详情</el-button>
            <el-button link type="danger">禁用</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[20,50,100]"
        layout="total,sizes,prev,pager,next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTable } from '@/composables/useTable'
import type { PageParams, PageResult } from '@/types'

const router = useRouter()

interface UserItem { id: number; nickname: string; phone: string; avatar: string; level: number; totalAmount: number; orderCount: number; regTime: string }

const mockUsers: UserItem[] = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  nickname: ['张三', '李四', '王五', '赵六', '小明'][i % 5],
  phone: `138****${1000 + i}`,
  avatar: `https://picsum.photos/36/36?random=${i + 200}`,
  level: [1, 2, 3, 1, 2][i % 5] as number,
  totalAmount: [12800, 56800, 98000, 3200, 15600][i % 5],
  orderCount: [3, 12, 28, 1, 6][i % 5],
  regTime: `2026-0${(i % 8) + 1}-${String(10 + (i % 20)).padStart(2, '0')}`
}))

const { tableData, loading, pagination, queryParams, handleSearch, handleReset, handleSizeChange, handlePageChange, loadData } = useTable<UserItem>({
  fetchApi: async (params: PageParams): Promise<PageResult<UserItem>> => {
    await new Promise(r => setTimeout(r, 300))
    let list = [...mockUsers]
    const start = (params.page - 1) * params.pageSize
    return { list: list.slice(start, start + params.pageSize), total: list.length, page: params.page, pageSize: params.pageSize }
  }
})
onMounted(() => { loadData() })
const { query } = queryParams
</script>

<style lang="scss" scoped>
.user-info { display: flex; align-items: center; gap: 10px; .user-name { font-weight: 500; } .user-phone { font-size: 12px; color: #909399; } }
</style>