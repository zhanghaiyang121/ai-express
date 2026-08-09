<script setup lang="ts">
import { OrderStatusMap, OrderStatusColors, PayMethodMap, OrderActionMap, AfterSaleStatusMap } from '@/types/order'
import type { OrderDetail, OrderStatus, AfterSaleStatus } from '@/types/order'

defineProps<{ order: OrderDetail; loading: boolean }>()
defineEmits<{ (e: 'close'): void; (e: 'ship', id: number): void; (e: 'confirm', id: number): void; (e: 'cancel', id: number): void }>()

function fmt(date: string | null) { return date ? new Date(date).toLocaleString('zh-CN') : '-' }
function fm(val: number) { return `¥${val.toFixed(2)}` }
</script>

<template>
  <div class="order-detail" v-loading="loading">
    <el-descriptions :column="3" border size="small" title="订单信息">
      <el-descriptions-item label="订单编号">{{ order.orderNo }}</el-descriptions-item>
      <el-descriptions-item label="订单状态">
        <el-tag :type="OrderStatusColors[order.status as OrderStatus]" size="small">{{ OrderStatusMap[order.status as OrderStatus] }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="下单用户">{{ order.userName }}</el-descriptions-item>
      <el-descriptions-item label="支付方式">{{ PayMethodMap[order.payMethod] }}</el-descriptions-item>
      <el-descriptions-item label="支付时间">{{ fmt(order.payTime) }}</el-descriptions-item>
      <el-descriptions-item label="下单时间">{{ fmt(order.createdAt) }}</el-descriptions-item>
      <el-descriptions-item label="商品总价">{{ fm(order.totalAmount) }}</el-descriptions-item>
      <el-descriptions-item label="优惠金额">{{ fm(order.discountAmount) }}</el-descriptions-item>
      <el-descriptions-item label="运费">{{ fm(order.freightAmount) }}</el-descriptions-item>
      <el-descriptions-item label="实付金额"><span class="money">{{ fm(order.payAmount) }}</span></el-descriptions-item>
      <el-descriptions-item label="收货信息">{{ order.receiverName }} / {{ order.receiverPhone }} / {{ order.receiverAddress }}</el-descriptions-item>
      <el-descriptions-item v-if="order.remark" label="用户备注">{{ order.remark }}</el-descriptions-item>
      <el-descriptions-item v-if="order.cancelReason" label="取消原因">{{ order.cancelReason }}</el-descriptions-item>
    </el-descriptions>

    <el-divider />
    <h4>商品明细</h4>
    <el-table :data="order.items" border size="small" style="margin-top: 12px">
      <el-table-column label="图片" width="80">
        <template #default="{ row: it }"><el-image :src="it.productImage" style="width: 50px; height: 50px" fit="cover" /></template>
      </el-table-column>
      <el-table-column prop="productName" label="商品名称" />
      <el-table-column prop="skuSpec" label="规格" width="150" />
      <el-table-column label="单价" width="100" align="right"><template #default="{ row: it }">{{ fm(it.price) }}</template></el-table-column>
      <el-table-column prop="quantity" label="数量" width="80" align="center" />
      <el-table-column label="小计" width="120" align="right"><template #default="{ row: it }"><span class="money">{{ fm(it.totalPrice) }}</span></template></el-table-column>
    </el-table>

    <template v-if="order.logistics">
      <el-divider />
      <h4>物流信息</h4>
      <el-descriptions :column="3" border size="small" style="margin-top: 12px">
        <el-descriptions-item label="物流公司">{{ order.logistics.company }}</el-descriptions-item>
        <el-descriptions-item label="运单号">{{ order.logistics.trackingNo }}</el-descriptions-item>
        <el-descriptions-item label="发货时间">{{ fmt(order.logistics.shipTime) }}</el-descriptions-item>
        <el-descriptions-item label="预计送达">{{ order.logistics.estimatedArrival || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-timeline style="margin-top: 16px">
        <el-timeline-item v-for="t in order.logistics.traces" :key="t.time" :timestamp="fmt(t.time)" placement="top" size="small">
          {{ t.status }} - {{ t.location }}
        </el-timeline-item>
      </el-timeline>
    </template>

    <template v-if="order.afterSale">
      <el-divider />
      <h4>售后信息</h4>
      <el-descriptions :column="3" border size="small" style="margin-top: 12px">
        <el-descriptions-item label="售后状态">
          <el-tag :type="order.afterSale.status === 'completed' ? 'success' : order.afterSale.status === 'rejected' ? 'danger' : 'warning'" size="small">{{ AfterSaleStatusMap[order.afterSale.status as AfterSaleStatus] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请原因">{{ order.afterSale.reason }}</el-descriptions-item>
        <el-descriptions-item label="退款金额">{{ fm(order.afterSale.refundAmount) }}</el-descriptions-item>
        <el-descriptions-item label="问题描述" :span="3">{{ order.afterSale.description }}</el-descriptions-item>
        <el-descriptions-item v-if="order.afterSale.auditResult" label="审核意见" :span="3">{{ order.afterSale.auditResult }}</el-descriptions-item>
      </el-descriptions>
    </template>

    <el-divider />
    <h4>操作日志</h4>
    <el-timeline style="margin-top: 12px">
      <el-timeline-item v-for="log in order.logs" :key="log.id" :timestamp="fmt(log.createdAt)" placement="top" size="small" :color="log.action === 'canceled' ? '#e74c3c' : log.action === 'refunded' ? '#f39c12' : '#409EFF'">
        <strong>{{ OrderActionMap[log.action] }}</strong>
        <span v-if="log.operator"> - {{ log.operator }}</span>
        <p style="margin: 4px 0 0; color: #666">{{ log.description }}</p>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<style scoped>
.order-detail { padding: 16px; }
.money { font-weight: 600; color: #e74c3c; }
h4 { margin: 0 0 4px; font-size: 15px; }
</style>