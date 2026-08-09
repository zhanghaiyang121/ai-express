<template>
  <div class="page-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="退款申请" name="refund" />
        <el-tab-pane label="退货申请" name="return" />
        <el-tab-pane label="换货申请" name="exchange" />
      </el-tabs>
      <el-table :data="tableData" stripe v-loading="loading" class="mt-16">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="reason" label="申请原因" min-width="200" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }">¥{{ row.amount.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="user" label="申请人" width="100" />
        <el-table-column prop="time" label="申请时间" width="170" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '待审核' ? 'warning' : row.status === '已通过' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-button v-if="row.status === '待审核'" link type="success" @click="handleApprove(row)">通过</el-button>
            <el-button v-if="row.status === '待审核'" link type="danger" @click="handleReject(row)">拒绝</el-button>
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('refund')
const loading = ref(false)

interface RefundItem {
  id: number
  orderNo: string
  reason: string
  amount: number
  user: string
  time: string
  status: string
}

const tableData = ref<RefundItem[]>([
  { id: 1, orderNo: 'DD20260001', reason: '商品与描述不符', amount: 8999, user: '张三', time: '2026-08-09 11:00', status: '待审核' },
  { id: 2, orderNo: 'DD20260005', reason: '收到商品破损', amount: 5999, user: '李四', time: '2026-08-08 15:30', status: '待审核' },
  { id: 3, orderNo: 'DD20260003', reason: '不想要了', amount: 1299, user: '王五', time: '2026-08-07 09:00', status: '已通过' },
  { id: 4, orderNo: 'DD20260008', reason: '质量问题', amount: 14999, user: '赵六', time: '2026-08-06 14:00', status: '已拒绝' }
])

function handleApprove(row: RefundItem): void {
  ElMessageBox.confirm(`确认通过 ${row.orderNo} 的申请?`, '审核', { type: 'success' }).then(() => {
    row.status = '已通过'
    ElMessage.success('已通过')
  })
}
function handleReject(row: RefundItem): void {
  ElMessageBox.confirm(`确认拒绝 ${row.orderNo} 的申请?`, '审核', { type: 'warning' }).then(() => {
    row.status = '已拒绝'
    ElMessage.success('已拒绝')
  })
}
function handleDetail(row: RefundItem): void {
  ElMessage.info(`查看详情: ${row.orderNo}`)
}
</script>