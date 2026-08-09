// ========== 订单状态枚举 ==========
export type OrderStatus =
  | 'pending_payment'
  | 'pending_shipment'
  | 'shipped'
  | 'completed'
  | 'canceled'
  | 'after_sale'

export const OrderStatusMap: Record<OrderStatus, string> = {
  pending_payment: '待付款',
  pending_shipment: '待发货',
  shipped: '已发货',
  completed: '已完成',
  canceled: '已取消',
  after_sale: '售后中',
}

export const OrderStatusColors: Record<OrderStatus, string> = {
  pending_payment: 'warning',
  pending_shipment: 'primary',
  shipped: 'success',
  completed: 'default',
  canceled: 'info',
  after_sale: 'danger',
}

// ========== 支付方式 ==========
export type PayMethod = 'wechat' | 'alipay' | 'card'

export const PayMethodMap: Record<PayMethod, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
  card: '银行卡',
}

// ========== 订单商品明细 ==========
export interface OrderItem {
  id: number
  orderId: number
  productId: number
  productName: string
  productImage: string
  skuId: number
  skuSpec: string
  price: number
  quantity: number
  totalPrice: number
}

// ========== 订单基本信息（列表用） ==========
export interface Order {
  id: number
  orderNo: string
  userId: number
  userName: string
  status: OrderStatus
  totalAmount: number
  discountAmount: number
  freightAmount: number
  payAmount: number
  payMethod: PayMethod
  payTime: string | null
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  remark: string
  adminRemark: string
  cancelReason: string | null
  cancelTime: string | null
  createdAt: string
  updatedAt: string
  itemCount?: number
  items?: OrderItem[]
}

// ========== 物流信息 ==========
export interface LogisticsTrace {
  time: string
  status: string
  location: string
}

export interface Logistics {
  id: number
  orderId: number
  company: string
  trackingNo: string
  shipTime: string | null
  estimatedArrival: string | null
  traces: LogisticsTrace[]
}

// ========== 售后单 ==========
export type AfterSaleType = 'refund'
export type AfterSaleStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export const AfterSaleStatusMap: Record<AfterSaleStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  completed: '已完成',
}

export interface AfterSale {
  id: number
  orderId: number
  orderNo: string
  type: AfterSaleType
  status: AfterSaleStatus
  reason: string
  description: string
  evidenceImages: string[]
  refundAmount: number
  auditResult: string | null
  auditTime: string | null
  completedTime: string | null
  createdAt: string
  updatedAt: string
}

// ========== 操作日志 ==========
export type OrderAction =
  | 'created'
  | 'paid'
  | 'shipped'
  | 'confirmed'
  | 'canceled'
  | 'after_sale'
  | 'refunded'
  | 'remark'

export const OrderActionMap: Record<OrderAction, string> = {
  created: '下单',
  paid: '支付',
  shipped: '发货',
  confirmed: '确认收货',
  canceled: '取消',
  after_sale: '申请售后',
  refunded: '已退款',
  remark: '添加备注',
}

export interface OrderLog {
  id: number
  orderId: number
  action: OrderAction
  description: string
  operator: string
  operatorId: number
  createdAt: string
}

// ========== 订单详情（含所有关联数据） ==========
export interface OrderDetail extends Order {
  items: OrderItem[]
  logistics: Logistics | null
  afterSale: AfterSale | null
  logs: OrderLog[]
}

// ========== 订单列表查询参数 ==========
export interface OrderListQuery {
  page: number
  pageSize: number
  orderNo?: string
  status?: OrderStatus
  keyword?: string
  startDate?: string
  endDate?: string
}

// ========== 创建订单参数 ==========
export interface CreateOrderParams {
  userId: number
  userName?: string
  items: CreateOrderItem[]
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  remark?: string
}

export interface CreateOrderItem {
  productId?: number
  productName?: string
  productImage?: string
  skuId?: number
  skuSpec?: string
  price?: number
  quantity: number
}

// ========== 发货参数 ==========
export interface ShipOrderParams {
  company: string
  trackingNo: string
}

// ========== 售后审核参数 ==========
export interface AfterSaleAuditParams {
  action: 'approved' | 'rejected'
  result?: string
}

// ========== 物流公司 ==========
export const LogisticsCompanies = ['顺丰', '中通', '圆通', '韵达', '京东', '邮政'] as const