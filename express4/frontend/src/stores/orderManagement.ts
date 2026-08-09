import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import * as orderApi from '@/api/modules/order'
import { Msg } from './message'
import type { Order, OrderDetail, OrderListQuery, OrderLog, Logistics, AfterSale, AfterSaleAuditParams, CreateOrderParams, ShipOrderParams } from '@/types/order'

export const useOrderManagementStore = defineStore('orderManagement', () => {
  // ========== State - 列表 ==========
  const orderList = ref<Order[]>([])
  const total = ref(0)
  const loading = ref(false)
  const query = reactive<OrderListQuery>({
    page: 1,
    pageSize: 10,
  })

  // ========== State - 详情 ==========
  const currentOrder = ref<OrderDetail | null>(null)
  const currentLogs = ref<OrderLog[]>([])
  const currentLogistics = ref<Logistics | null>(null)
  const detailLoading = ref(false)

  // ========== State - 售后 ==========
  const afterSaleList = ref<AfterSale[]>([])
  const afterSaleTotal = ref(0)
  const afterSaleLoading = ref(false)

  // ========== State - 弹窗 ==========
  const showCreateDialog = ref(false)
  const showShipDialog = ref(false)
  const showCancelDialog = ref(false)
  const showDetailDrawer = ref(false)
  const showAfterSaleAuditDialog = ref(false)
  const currentAfterSale = ref<AfterSale | null>(null)

  // ========== Actions ==========

  /** 获取订单列表 */
  async function fetchOrderList(params?: Partial<OrderListQuery>) {
    if (params) {
      Object.assign(query, params)
    }
    loading.value = true
    try {
      const res = await orderApi.getOrderList({ ...query })
      const data = res.data.data
      orderList.value = data.list
      total.value = data.total
    } catch {
      Msg.error('获取订单列表失败')
    } finally {
      loading.value = false
    }
  }

  /** 获取订单详情 */
  async function fetchOrderDetail(id: number) {
    detailLoading.value = true
    try {
      const res = await orderApi.getOrderDetail(id)
      currentOrder.value = res.data.data
      currentLogs.value = currentOrder.value.logs || []
      currentLogistics.value = currentOrder.value.logistics || null
    } catch {
      Msg.error('获取订单详情失败')
    } finally {
      detailLoading.value = false
    }
  }

  /** 创建订单 */
  async function createOrder(data: CreateOrderParams) {
    try {
      await orderApi.createOrder(data)
      Msg.success('订单创建成功')
      showCreateDialog.value = false
      await fetchOrderList({ page: 1 })
      return true
    } catch {
      Msg.error('订单创建失败')
      return false
    }
  }

  /** 取消订单 */
  async function cancelOrder(id: number, reason: string) {
    try {
      await orderApi.cancelOrder(id, reason)
      Msg.success('订单已取消')
      showCancelDialog.value = false
      await fetchOrderList()
      return true
    } catch {
      Msg.error('取消订单失败')
      return false
    }
  }

  /** 发货 */
  async function shipOrder(id: number, data: ShipOrderParams) {
    try {
      await orderApi.shipOrder(id, data)
      Msg.success('发货成功')
      showShipDialog.value = false
      await fetchOrderDetail(id)
      await fetchOrderList()
      return true
    } catch {
      Msg.error('发货失败')
      return false
    }
  }

  /** 确认收货 */
  async function confirmOrder(id: number) {
    try {
      await orderApi.confirmOrder(id)
      Msg.success('确认收货成功')
      await fetchOrderDetail(id)
      await fetchOrderList()
      return true
    } catch {
      Msg.error('确认收货失败')
      return false
    }
  }

  /** 获取售后列表 */
  async function fetchAfterSaleList(params?: { page?: number; pageSize?: number; status?: string }) {
    afterSaleLoading.value = true
    try {
      const res = await orderApi.getAfterSaleList({ page: 1, pageSize: 10, ...params })
      const data = res.data.data
      afterSaleList.value = data.list
      afterSaleTotal.value = data.total
    } catch {
      Msg.error('获取售后列表失败')
    } finally {
      afterSaleLoading.value = false
    }
  }

  /** 审核售后 */
  async function auditAfterSale(id: number, data: AfterSaleAuditParams) {
    try {
      await orderApi.auditAfterSale(id, data)
      Msg.success(data.action === 'approved' ? '售后审核通过' : '售后已拒绝')
      showAfterSaleAuditDialog.value = false
      await fetchAfterSaleList()
      if (currentOrder.value) {
        await fetchOrderDetail(currentOrder.value.id)
      }
      return true
    } catch {
      Msg.error('售后审核失败')
      return false
    }
  }

  /** 查询物流 */
  async function fetchLogistics(id: number) {
    try {
      const res = await orderApi.getOrderLogistics(id)
      currentLogistics.value = res.data.data
    } catch {
      Msg.error('获取物流信息失败')
    }
  }

  /** 查询操作日志 */
  async function fetchOrderLogs(id: number) {
    try {
      const res = await orderApi.getOrderLogs(id)
      currentLogs.value = res.data.data
    } catch {
      Msg.error('获取操作日志失败')
    }
  }

  /** 重置状态 */
  function resetState() {
    orderList.value = []
    total.value = 0
    loading.value = false
    query.page = 1
    query.pageSize = 10
    query.orderNo = undefined
    query.status = undefined
    query.keyword = undefined
    query.startDate = undefined
    query.endDate = undefined
    currentOrder.value = null
    currentLogs.value = []
    currentLogistics.value = null
    afterSaleList.value = []
    afterSaleTotal.value = 0
  }

  return {
    // 列表
    orderList,
    total,
    loading,
    query,
    // 详情
    currentOrder,
    currentLogs,
    currentLogistics,
    detailLoading,
    // 售后
    afterSaleList,
    afterSaleTotal,
    afterSaleLoading,
    // 弹窗
    showCreateDialog,
    showShipDialog,
    showCancelDialog,
    showDetailDrawer,
    showAfterSaleAuditDialog,
    currentAfterSale,
    // Actions
    fetchOrderList,
    fetchOrderDetail,
    createOrder,
    cancelOrder,
    shipOrder,
    confirmOrder,
    fetchAfterSaleList,
    auditAfterSale,
    fetchLogistics,
    fetchOrderLogs,
    resetState,
  }
})