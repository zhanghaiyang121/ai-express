<script setup lang="ts">
import { OrderStatusMap, OrderStatusColors, PayMethodMap } from '@/types/order'
import type { Order, OrderStatus, PayMethod } from '@/types/order'

const props = withDefaults(defineProps<{
  data: Order[]
  loading: boolean
  total: number
  currentPage: number
  pageSize: number
}>(), {
  data: () => [],
  loading: false,
  total: 0,
  currentPage: 1,
  pageSize: 10,
})

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'view-detail', id: number): void
  (e: 'ship', order: Order): void
  (e: 'cancel', order: Order): void
  (e: 'confirm', order: Order): void
  (e: 'pay', order: Order): void
}>()

function formatTime(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

function formatMoney(val: number) {
  return `¥${val.toFixed(2)}`
}
</script>

<template>
  <div class="order-table-wrapper">
    <el-table
      :data="data"
      v-loading="loading"
      stripe
      border
      style="width: 100%"
      :row-class-name="({ row }: { row: Order }) => row.status === 'canceled' ? 'row-canceled' : ''"
    >
      <el-table-column prop="orderNo" label="订单编号" width="180" align="center" />
      <el-table-column prop="userName" label="下单用户" width="100" align="center" />
      <el-table-column prop="itemCount" label="商品数量" width="80" align="center" />
      <el-table-column label="实付金额" width="110" align="center">
        <template #default="{ row }">
          <span class="money">{{ formatMoney(row.payAmount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" width="100" align="center">
        <template #default="{ row }">
          {{ row.payTime ? PayMethodMap[(row.payMethod as PayMethod)] || row.payMethod : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="订单状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="OrderStatusColors[row.status as OrderStatus]" size="small">
            {{ OrderStatusMap[row.status as OrderStatus] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="receiverName" label="收货人" width="100" align="center" />
      <el-table-column label="下单时间" width="170" align="center">
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template #default="{ row }">
          <div class="action-btns">
            <el-button link type="primary" size="small" @click="emit('view-detail', row.id)">
              详情
            </el-button>
            <template v-if="row.status === 'pending_payment'">
              <el-button link type="success" size="small" @click="emit('pay', row)">
                支付
              </el-button>
              <el-button link type="warning" size="small" @click="emit('cancel', row)">
                取消
              </el-button>
            </template>
            <el-button v-if="row.status === 'pending_shipment'" link type="primary" size="small" @click="emit('ship', row)">
              发货
            </el-button>
            <el-button v-if="row.status === 'shipped'" link type="success" size="small" @click="emit('confirm', row)">
              确认收货
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="props.currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="(page: number) => emit('page-change', page)"
        @size-change="(size: number) => emit('size-change', size)"
      />
    </div>
  </div>
</template>

<style scoped>
.order-table-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.money {
  font-weight: 600;
  color: #e74c3c;
}

.action-btns {
  display: flex;
  gap: 4px;
  justify-content: center;
}

:deep(.row-canceled) {
  background-color: #f5f5f5;
  color: #999;
}
</style>