<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useOrderManagementStore } from '@/stores/orderManagement'
import { OrderStatusMap } from '@/types/order'
import type { OrderStatus, Order, AfterSale, CreateOrderParams, ShipOrderParams } from '@/types/order'
import OrderTable from '@/components/OrderTable.vue'
import OrderDetail from '@/components/OrderDetail.vue'
import OrderFormDialog from '@/components/OrderFormDialog.vue'
import AfterSaleDialog from '@/components/AfterSaleDialog.vue'
import { Msg } from '@/stores/message'

const store = useOrderManagementStore()

const statusOptions: Array<{ label: string; value: OrderStatus | '' }> = [
  { label: '全部', value: '' },
  ...Object.entries(OrderStatusMap).map(([value, label]) => ({ label, value: value as OrderStatus })),
]

// 选中待操作的订单
const selectedOrder = ref<Order | null>(null)
const cancelReason = ref('')
const shipForm = reactive<ShipOrderParams>({ company: '顺丰', trackingNo: '' })

// 当前激活的 tab
const activeTab = ref<'orders' | 'afterSales'>('orders')

onMounted(() => {
  store.fetchOrderList()
})

function handleSearch() {
  store.fetchOrderList({ page: 1 })
}

function handleReset() {
  store.query.orderNo = undefined
  store.query.status = undefined
  store.query.keyword = undefined
  store.query.startDate = undefined
  store.query.endDate = undefined
  store.fetchOrderList({ page: 1 })
}

function handlePageChange(page: number) {
  store.fetchOrderList({ page })
}

function handleSizeChange(size: number) {
  store.fetchOrderList({ pageSize: size, page: 1 })
}

// 详情
function handleViewDetail(id: number) {
  store.fetchOrderDetail(id)
  store.showDetailDrawer = true
}

// 支付
async function handlePay(_order: Order) {
  Msg.success('模拟支付成功')
  // Mock 支付：实际项目中应调用支付 API
  store.fetchOrderList()
}

// 取消
function handleCancel(order: Order) {
  selectedOrder.value = order
  cancelReason.value = ''
  store.showCancelDialog = true
}

async function doCancel() {
  if (!cancelReason.value.trim() || !selectedOrder.value) return
  await store.cancelOrder(selectedOrder.value.id, cancelReason.value)
  selectedOrder.value = null
}

// 发货
function handleShip(order: Order) {
  selectedOrder.value = order
  shipForm.company = '顺丰'
  shipForm.trackingNo = ''
  store.showShipDialog = true
}

async function doShip() {
  if (!selectedOrder.value || !shipForm.company || !shipForm.trackingNo) return
  await store.shipOrder(selectedOrder.value.id, { ...shipForm })
  selectedOrder.value = null
}

// 确认收货
async function handleConfirm(order: Order) {
  await store.confirmOrder(order.id)
}

// 创建订单
function handleCreateSubmit(data: CreateOrderParams) {
  store.createOrder(data)
}

// 售后标签切换
function handleTabChange(tab: 'orders' | 'afterSales') {
  activeTab.value = tab
  if (tab === 'afterSales') {
    store.fetchAfterSaleList()
  }
}

// 售后审核
function handleAfterSaleAudit(afterSale: AfterSale) {
  store.currentAfterSale = afterSale
  store.showAfterSaleAuditDialog = true
}

async function doAudit(id: number, action: 'approved' | 'rejected', result: string) {
  await store.auditAfterSale(id, { action, result })
}
</script>

<template>
  <div class="order-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>📦 订单管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="store.showCreateDialog = true">+ 创建订单</el-button>
      </div>
    </div>

    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" @tab-change="(tab: string) => handleTabChange(tab as 'orders' | 'afterSales')">
      <el-tab-pane label="订单列表" name="orders">
        <!-- 筛选区 -->
        <div class="filter-bar">
          <el-input v-model="store.query.orderNo" placeholder="订单编号" clearable style="width: 200px" />
          <el-select v-model="store.query.status" placeholder="订单状态" clearable style="width: 140px">
            <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
          <el-input v-model="store.query.keyword" placeholder="收货人/电话" clearable style="width: 180px" />
          <el-date-picker v-model="store.query.startDate" type="date" placeholder="开始日期" style="width: 150px" value-format="YYYY-MM-DD" />
          <el-date-picker v-model="store.query.endDate" type="date" placeholder="结束日期" style="width: 150px" value-format="YYYY-MM-DD" />
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>

        <!-- 订单表格 -->
        <OrderTable
          :data="store.orderList"
          :loading="store.loading"
          :total="store.total"
          :current-page="store.query.page"
          :page-size="store.query.pageSize"
          @page-change="handlePageChange"
          @size-change="handleSizeChange"
          @view-detail="handleViewDetail"
          @pay="handlePay"
          @ship="handleShip"
          @cancel="handleCancel"
          @confirm="handleConfirm"
        />
      </el-tab-pane>

      <el-tab-pane label="售后列表" name="afterSales">
        <el-table :data="store.afterSaleList" v-loading="store.afterSaleLoading" stripe border>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="orderNo" label="订单编号" width="180" />
          <el-table-column prop="reason" label="申请原因" min-width="150" />
          <el-table-column label="退款金额" width="120" align="right">
            <template #default="{ row }">¥{{ row.refundAmount.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'pending' ? 'warning' : row.status === 'completed' ? 'success' : 'danger'" size="small">
                {{ row.status === 'pending' ? '待审核' : row.status === 'completed' ? '已通过' : '已拒绝' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="申请时间" width="170">
            <template #default="{ row }">{{ new Date(row.createdAt).toLocaleString('zh-CN') }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button v-if="row.status === 'pending'" link type="primary" size="small" @click="handleAfterSaleAudit(row)">审核</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 订单详情抽屉 -->
    <el-drawer v-model="store.showDetailDrawer" title="订单详情" size="700px" direction="rtl">
      <OrderDetail v-if="store.currentOrder" :order="store.currentOrder" :loading="store.detailLoading" />
    </el-drawer>

    <!-- 创建订单弹窗 -->
    <OrderFormDialog v-model:visible="store.showCreateDialog" :loading="store.loading" @submit="handleCreateSubmit" />

    <!-- 取消订单弹窗 -->
    <el-dialog v-model="store.showCancelDialog" title="取消订单" width="450px" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="订单编号">{{ selectedOrder?.orderNo }}</el-form-item>
        <el-form-item label="取消原因" required>
          <el-input v-model="cancelReason" type="textarea" :rows="3" placeholder="请填写取消原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="store.showCancelDialog = false">取消</el-button>
        <el-button type="danger" :loading="store.loading" @click="doCancel">确认取消</el-button>
      </template>
    </el-dialog>

    <!-- 发货弹窗 -->
    <el-dialog v-model="store.showShipDialog" title="订单发货" width="450px" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item label="订单编号">{{ selectedOrder?.orderNo }}</el-form-item>
        <el-form-item label="物流公司" required>
          <el-select v-model="shipForm.company" style="width: 100%">
            <el-option v-for="c in ['顺丰','中通','圆通','韵达','京东','邮政']" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" required>
          <el-input v-model="shipForm.trackingNo" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="store.showShipDialog = false">取消</el-button>
        <el-button type="primary" :loading="store.loading" @click="doShip">确认发货</el-button>
      </template>
    </el-dialog>

    <!-- 售后审核弹窗 -->
    <AfterSaleDialog
      v-model:visible="store.showAfterSaleAuditDialog"
      :data="store.currentAfterSale"
      :loading="store.afterSaleLoading"
      @audit="doAudit"
    />
  </div>
</template>

<style scoped>
.order-management { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; }
.filter-bar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; padding: 12px; background: #fff; border-radius: 8px; }
</style>