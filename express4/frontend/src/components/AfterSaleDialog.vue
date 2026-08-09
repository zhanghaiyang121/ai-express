<script setup lang="ts">
import { ref } from 'vue'
import type { AfterSale, AfterSaleStatus } from '@/types/order'
import { AfterSaleStatusMap } from '@/types/order'

const props = defineProps<{ visible: boolean; data: AfterSale | null; loading: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'audit', id: number, action: 'approved' | 'rejected', result: string): void
}>()

const result = ref('')

function handleAudit(action: 'approved' | 'rejected') {
  if (props.data) {
    emit('audit', props.data.id, action, result.value)
    result.value = ''
  }
}

function handleClose() {
  result.value = ''
  emit('update:visible', false)
}

function fmt(date: string | null) { return date ? new Date(date).toLocaleString('zh-CN') : '-' }
function fm(val: number) { return `¥${val.toFixed(2)}` }
</script>

<template>
  <el-dialog :model-value="visible" title="售后审核" width="550px" @close="handleClose" :close-on-click-modal="false">
    <div v-if="data" v-loading="loading">
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item label="订单编号">{{ data.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="售后状态">
          <el-tag size="small" :type="data.status === 'pending' ? 'warning' : data.status === 'completed' ? 'success' : 'danger'">
            {{ AfterSaleStatusMap[data.status as AfterSaleStatus] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请原因">{{ data.reason }}</el-descriptions-item>
        <el-descriptions-item label="问题描述">{{ data.description }}</el-descriptions-item>
        <el-descriptions-item label="退款金额"><span style="color:#e74c3c;font-weight:600">{{ fm(data.refundAmount) }}</span></el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ fmt(data.createdAt) }}</el-descriptions-item>
      </el-descriptions>

      <template v-if="data.status === 'pending'">
        <el-divider />
        <el-input v-model="result" type="textarea" :rows="3" placeholder="请输入审核意见" />
        <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: flex-end">
          <el-button type="danger" :loading="loading" @click="handleAudit('rejected')">拒绝退款</el-button>
          <el-button type="success" :loading="loading" @click="handleAudit('approved')">同意退款</el-button>
        </div>
      </template>
    </div>
    <template v-if="!data || data.status !== 'pending'" #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>