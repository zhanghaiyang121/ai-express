<template>
  <div class="page-container">
    <el-card class="mb-16"><el-steps :active="statusStep" align-center><el-step title="待付款" /><el-step title="待发货" /><el-step title="待收货" /><el-step title="已完成" /></el-steps></el-card>
    <el-row :gutter="16">
      <el-col :span="12"><el-card header="基本信息" class="mb-16"><el-descriptions :column="1" border><el-descriptions-item label="订单号">{{order.orderNo}}</el-descriptions-item><el-descriptions-item label="下单时间">{{order.createTime}}</el-descriptions-item><el-descriptions-item label="支付方式">{{order.payMethod}}</el-descriptions-item></el-descriptions></el-card></el-col>
      <el-col :span="12"><el-card header="收货信息" class="mb-16"><el-descriptions :column="1" border><el-descriptions-item label="收货人">{{order.receiver}}</el-descriptions-item><el-descriptions-item label="联系电话">{{order.phone}}</el-descriptions-item><el-descriptions-item label="收货地址">{{order.address}}</el-descriptions-item></el-descriptions></el-card></el-col>
    </el-row>
    <el-card header="商品信息" class="mb-16"><el-table :data="order.goodsList" border><el-table-column label="商品"><template #default="{row}">{{row.name}} - {{row.spec}}</template></el-table-column><el-table-column prop="price" label="单价" width="120" /><el-table-column prop="count" label="数量" width="80" /><el-table-column label="小计" width="120"><template #default="{row}">¥{{(row.price*row.count).toFixed(2)}}</template></el-table-column></el-table></el-card>
    <el-row :gutter="16">
      <el-col :span="12"><el-card header="金额明细"><el-descriptions :column="1" border><el-descriptions-item label="商品总价">¥{{order.totalAmount.toFixed(2)}}</el-descriptions-item><el-descriptions-item label="运费">¥{{order.freight.toFixed(2)}}</el-descriptions-item><el-descriptions-item label="实付金额"><span style="font-size:18px;color:#F56C6C;font-weight:600">¥{{order.payAmount.toFixed(2)}}</span></el-descriptions-item></el-descriptions></el-card></el-col>
      <el-col :span="12"><el-card header="操作记录"><el-timeline><el-timeline-item v-for="(log,i) in order.logs" :key="i" :timestamp="log.time" :type="log.type">{{log.content}}</el-timeline-item></el-timeline></el-card></el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
const order = ref({ orderNo:'DD20260001', status:'paid', createTime:'2026-08-09 10:30', payMethod:'微信支付', receiver:'张三', phone:'138****1234', address:'广东省深圳市南山区科技园', totalAmount:8999, freight:0, discount:200, payAmount:8799, goodsList:[{name:'iPhone 15 Pro Max', spec:'颜色:远峰蓝', price:8999, count:1}], logs:[{time:'08-09 10:30',content:'用户下单',type:'primary'},{time:'08-09 10:32',content:'付款成功',type:'success'}] })
const statusStep = computed(()=>{ const map:Record<string,number>={pending:0,paid:1,shipped:2,completed:3}; return map[order.value.status]||0 })
</script>