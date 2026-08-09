import request from '@/utils/request'
import type { ApiResponse, PaginationData } from '@/types'
import type {
  Order,
  OrderDetail,
  OrderListQuery,
  CreateOrderParams,
  ShipOrderParams,
  AfterSale,
  AfterSaleAuditParams,
  Logistics,
  OrderLog,
} from '@/types/order'

// ==================== 订单 API ====================

/** 分页获取订单列表 */
export function getOrderList(params: OrderListQuery) {
  return request.get<ApiResponse<PaginationData<Order>>>('/v1/orders', { params })
}

/** 获取订单完整详情 */
export function getOrderDetail(id: number) {
  return request.get<ApiResponse<OrderDetail>>(`/v1/orders/${id}`)
}

/** 创建订单 */
export function createOrder(data: CreateOrderParams) {
  return request.post<ApiResponse<OrderDetail>>('/v1/orders', data)
}

/** 取消订单 */
export function cancelOrder(id: number, reason: string) {
  return request.patch<ApiResponse<OrderDetail>>(`/v1/orders/${id}/cancel`, { reason })
}

/** 订单发货 */
export function shipOrder(id: number, data: ShipOrderParams) {
  return request.patch<ApiResponse<OrderDetail>>(`/v1/orders/${id}/ship`, data)
}

/** 确认收货 */
export function confirmOrder(id: number) {
  return request.patch<ApiResponse<OrderDetail>>(`/v1/orders/${id}/confirm`)
}

/** 查询物流轨迹 */
export function getOrderLogistics(id: number) {
  return request.get<ApiResponse<Logistics | null>>(`/v1/orders/${id}/logistics`)
}

/** 获取操作日志 */
export function getOrderLogs(id: number) {
  return request.get<ApiResponse<OrderLog[]>>(`/v1/orders/${id}/logs`)
}

// ==================== 售后 API ====================

/** 分页获取售后列表 */
export function getAfterSaleList(params: { page: number; pageSize: number; status?: string }) {
  return request.get<ApiResponse<PaginationData<AfterSale>>>('/v1/after-sales', { params })
}

/** 审核售后 */
export function auditAfterSale(id: number, data: AfterSaleAuditParams) {
  return request.patch<ApiResponse<AfterSale>>(`/v1/after-sales/${id}/audit`, data)
}