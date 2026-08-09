<template>
  <div class="page-container">
    <el-card header="用户基础信息" class="mb-16">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="用户ID">{{ user.id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ user.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user.email }}</el-descriptions-item>
        <el-descriptions-item label="等级">
          <el-tag size="small" :type="user.level===3?'warning':user.level===2?'':'info'">{{ ['','普通','银卡','金卡'][user.level] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ user.regTime }}</el-descriptions-item>
        <el-descriptions-item label="消费总额">¥{{ user.totalAmount.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="订单总数">{{ user.orderCount }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card header="收货地址" class="mb-16">
      <el-table :data="user.addresses" border>
        <el-table-column prop="name" label="收货人" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="address" label="地址" />
        <el-table-column label="默认" width="80">
          <template #default="{ row }"><el-tag v-if="row.isDefault" size="small" type="success">默认</el-tag></template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card header="最近订单">
      <el-table :data="user.recentOrders" border>
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="goodsName" label="商品" />
        <el-table-column label="金额" width="120"><template #default="{ row }">¥{{ row.amount.toFixed(2) }}</template></el-table-column>
        <el-table-column prop="time" label="下单时间" />
        <el-table-column prop="status" label="状态" width="100"><template #default="{ row }"><el-tag size="small">{{ row.status }}</el-tag></template></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const user = ref({
  id: 10001, nickname: '张三', phone: '138****1234', email: 'zhangsan@example.com',
  level: 2, regTime: '2026-01-15', totalAmount: 56800, orderCount: 12,
  addresses: [
    { name: '张三', phone: '138****1234', address: '广东省深圳市南山区科技园路1号', isDefault: true },
    { name: '张三', phone: '138****1234', address: '北京市朝阳区望京SOHO', isDefault: false }
  ],
  recentOrders: [
    { orderNo: 'DD20260001', goodsName: 'iPhone 15 Pro Max', amount: 8999, time: '2026-08-09 10:30', status: '待发货' },
    { orderNo: 'DD20260015', goodsName: 'AirPods Pro', amount: 1299, time: '2026-08-05 14:20', status: '已完成' },
    { orderNo: 'DD20260028', goodsName: 'MacBook Pro', amount: 14999, time: '2026-07-28 09:15', status: '已完成' }
  ]
})
</script>