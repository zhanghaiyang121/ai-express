<template>
  <div class="page-container">
    <el-card>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待付款" name="pending" />
        <el-tab-pane label="待发货" name="paid" />
        <el-tab-pane label="待收货" name="shipped" />
        <el-tab-pane label="已完成" name="completed" />
        <el-tab-pane label="已取消" name="cancelled" />
      </el-tabs>

      <el-form :model="queryParams" inline class="search-form mt-16">
        <el-form-item label="订单号">
          <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable style="width:180px" />
        </el-form-item>
        <el-form-item label="收货人">
          <el-input v-model="queryParams.receiver" placeholder="收货人/手机号" clearable style="width:160px" />
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker v-model="queryParams.dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" style="width:240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column label="商品信息" min-width="200">
          <template #default="{ row }">
            <div class="goods-info">
              <el-image :src="row.image" fit="cover" class="goods-thumb" />
              <span class="text-ellipsis">{{ row.goodsName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120" align="center">
          <template #default="{ row }">¥{{ row.amount.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="receiver" label="买家" width="120" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push('/order/detail/' + row.id)">详情</el-button>
            <el-button v-if="row.status === 'paid'" link type="primary" @click="handleShip(row)">发货</el-button>
            <el-button link type="primary" @click="handleRemark(row)">备注</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useTable } from '@/composables/useTable'
import type { PageParams, PageResult } from '@/types'

const router = useRouter()
const activeTab = ref('all')

interface OrderItem { id: number; orderNo: string; goodsName: string; image: string; amount: number; receiver: string; status: string }

const mockOrders: OrderItem[] = Array.from({ length: 38 }, (_, i) => ({
  id: i + 1,
  orderNo: `DD${String(20260001 + i)}`,
  goodsName: ['iPhone 15 Pro', '华为Mate 60', '小米14 Ultra', 'AirPods Pro', 'MacBook Pro'][i % 5],
  image: `https://picsum.photos/60/60?random=${i + 50}`,
  amount: [8999, 6999, 5999, 1299, 14999][i % 5],
  receiver: ['张三', '李四', '王五', '赵六'][i % 4],
  status: ['pending','paid','shipped','completed','cancelled'][i % 5]
}))

const { tableData, loading, pagination, queryParams, handleSearch, handleReset, handleSizeChange, handlePageChange, loadData } = useTable<OrderItem>({
  fetchApi: async (params: PageParams): Promise<PageResult<OrderItem>> => {
    await new Promise((r) => setTimeout(r, 300))
    let list = [...mockOrders]
    if (activeTab.value !== 'all') list = list.filter((o) => o.status === activeTab.value)
    const kw = (params.orderNo as string || '').toLowerCase()
    if (kw) list = list.filter((o) => o.orderNo.toLowerCase().includes(kw))
    const start = (params.page - 1) * params.pageSize
    return { list: list.slice(start, start + params.pageSize), total: list.length, page: params.page, pageSize: params.pageSize }
  }
})

function statusTag(status: string): 'warning' | 'primary' | 'success' | 'info' | 'danger' {
  const map: Record<string, 'warning'|'primary'|'success'|'info'|'danger'> = { pending:'warning', paid:'primary', shipped:'primary', completed:'success', cancelled:'info' }
  return map[status] || 'info'
}
function statusLabel(status: string): string {
  const map: Record<string, string> = { pending:'待付款', paid:'待发货', shipped:'待收货', completed:'已完成', cancelled:'已取消' }
  return map[status] || status
}

function handleTabChange(): void { handleSearch() }
function handleShip(row: OrderItem): void { ElMessage.success(`订单 ${row.orderNo} 已发货`) }
function handleRemark(row: OrderItem): void { ElMessage.info('添加备注') }

onMounted(() => { loadData() })
</script>

<style lang="scss" scoped>
.goods-info { display: flex; align-items: center; gap: 8px; .goods-thumb { width: 48px; height: 48px; border-radius: 4px; flex-shrink: 0; } }
</style>