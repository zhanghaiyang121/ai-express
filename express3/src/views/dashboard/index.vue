<template>
  <div class="dashboard-container">
    <!-- 数据卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :lg="6" v-for="card in statCards" :key="card.title">
        <StatCard v-bind="card" />
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>7日销售趋势</span>
              <el-radio-group v-model="trendType" size="small">
                <el-radio-button value="amount">销售额</el-radio-button>
                <el-radio-button value="count">订单量</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <span>商品销售 TOP10</span>
          </template>
          <div ref="topChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办 + 快捷入口 -->
    <el-row :gutter="16" class="bottom-row">
      <el-col :xs="24" :lg="12">
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-tag size="small" type="warning">{{ todoList.length }} 项待处理</el-tag>
            </div>
          </template>
          <div class="todo-list">
            <div v-if="todoList.length === 0" class="empty-state">暂无待办事项</div>
            <div
              v-for="todo in todoList"
              :key="todo.id"
              class="todo-item"
              @click="handleTodoClick(todo)"
            >
              <el-badge :value="todo.count" :type="todo.badgeType" class="todo-badge">
                <el-icon :size="18" :color="todo.iconColor">
                  <component :is="todo.icon" />
                </el-icon>
              </el-badge>
              <div class="todo-info">
                <span class="todo-title">{{ todo.title }}</span>
                <span class="todo-desc">{{ todo.desc }}</span>
              </div>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="quick-card">
          <template #header><span>快捷入口</span></template>
          <div class="quick-actions">
            <div
              v-for="action in quickActions"
              :key="action.title"
              class="quick-item"
              @click="router.push(action.path)"
            >
              <div class="quick-icon" :style="{ backgroundColor: action.bg }">
                <el-icon :size="22" :color="action.color">
                  <component :is="action.icon" />
                </el-icon>
              </div>
              <span class="quick-title">{{ action.title }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  Money, ShoppingCartFull, UserFilled, Clock,
  Box, List, Warning, ArrowRight
} from '@element-plus/icons-vue'
import StatCard from '@/components/StatCard.vue'

const router = useRouter()

/** 趋势图表类型 */
const trendType = ref('amount')
const trendChartRef = ref<HTMLElement>()
const topChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let topChart: echarts.ECharts | null = null

/** 数据卡片 */
const statCards = [
  {
    title: '今日销售额',
    value: 128600,
    prefix: '¥',
    trend: 12.5,
    icon: Money,
    iconColor: '#409EFF',
    iconBg: 'rgba(64, 158, 255, 0.1)'
  },
  {
    title: '今日订单数',
    value: 586,
    trend: -3.2,
    icon: ShoppingCartFull,
    iconColor: '#67C23A',
    iconBg: 'rgba(103, 194, 58, 0.1)'
  },
  {
    title: '新增用户',
    value: 128,
    trend: 8.8,
    trendLabel: '较昨日',
    icon: UserFilled,
    iconColor: '#E6A23C',
    iconBg: 'rgba(230, 162, 60, 0.1)'
  },
  {
    title: '待处理订单',
    value: 36,
    icon: Clock,
    iconColor: '#F56C6C',
    iconBg: 'rgba(245, 108, 108, 0.1)'
  }
]

/** 待办列表 */
const todoList = [
  { id: 1, title: '待发货订单', desc: '有12笔订单等待发货', count: 12, badgeType: 'warning' as const, icon: Box, iconColor: '#E6A23C' },
  { id: 2, title: '待处理退款', desc: '有8笔退款申请待审核', count: 8, badgeType: 'danger' as const, icon: Warning, iconColor: '#F56C6C' },
  { id: 3, title: '待审核商品', desc: '有5个商品待上架审核', count: 5, badgeType: 'primary' as const, icon: List, iconColor: '#409EFF' }
]

/** 快捷入口 */
const quickActions = [
  { title: '发布商品', path: '/goods/publish', icon: Box, color: '#409EFF', bg: 'rgba(64,158,255,0.1)' },
  { title: '查看订单', path: '/order/list', icon: ShoppingCartFull, color: '#67C23A', bg: 'rgba(103,194,58,0.1)' },
  { title: '处理退款', path: '/order/refund', icon: Warning, color: '#E6A23C', bg: 'rgba(230,162,60,0.1)' },
  { title: '用户管理', path: '/user/list', icon: UserFilled, color: '#909399', bg: 'rgba(144,147,153,0.1)' }
]

/** 待办点击 */
function handleTodoClick(todo: typeof todoList[0]): void {
  if (todo.id === 1) router.push('/order/list')
  else if (todo.id === 2) router.push('/order/refund')
  else if (todo.id === 3) router.push('/goods/list')
}

/** 初始化趋势图 */
function initTrendChart(): void {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  const days = ['周一','周二','周三','周四','周五','周六','周日']
  const data = [18200, 21500, 16800, 23400, 19800, 25600, 12800]
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, right: 20, bottom: 30, left: 60 },
    xAxis: { type: 'category', data: days, axisLine: { lineStyle: { color: '#DCDFE6' } } },
    yAxis: { 
      type: 'value',
      axisLabel: { formatter: (v: number) => `¥${(v / 10000).toFixed(1)}w` }
    },
    series: [{
      data,
      type: 'line',
      smooth: true,
      lineStyle: { color: '#409EFF', width: 3 },
      itemStyle: { color: '#409EFF' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0,0,0,1, [
          { offset: 0, color: 'rgba(64,158,255,0.3)' },
          { offset: 1, color: 'rgba(64,158,255,0.02)' }
        ])
      }
    }]
  })
}

/** 初始化TOP10图 */
function initTopChart(): void {
  if (!topChartRef.value) return
  topChart = echarts.init(topChartRef.value)
  const items = ['iPhone 15','华为 Mate60','AirPods Pro','MacBook Air','小米14','iPad Air','三星 S24','索尼耳机','戴尔显示器','机械键盘']
  const values = [8920, 7650, 6890, 5430, 4820, 3980, 3210, 2760, 1980, 1520]
  topChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 10, right: 30, bottom: 20, left: 10 },
    xAxis: { type: 'value', show: false },
    yAxis: { type: 'category', data: items.reverse(), inverse: true, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 12 } },
    series: [{
      data: values.reverse(),
      type: 'bar',
      barWidth: 14,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: new echarts.graphic.LinearGradient(0,0,1,0, [
          { offset: 0, color: '#409EFF' },
          { offset: 1, color: '#79bbff' }
        ])
      },
      label: { show: true, position: 'right', fontSize: 11, color: '#606266', formatter: (p: { value: number }) => `¥${(p.value).toLocaleString()}` }
    }]
  })
}

onMounted(async () => {
  await nextTick()
  initTrendChart()
  initTopChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  trendChart?.dispose()
  topChart?.dispose()
  window.removeEventListener('resize', handleResize)
})

function handleResize(): void {
  trendChart?.resize()
  topChart?.resize()
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  .stat-row { margin-bottom: 16px; }
  .chart-row { margin-bottom: 16px; }
  
  .chart-card {
    margin-bottom: 16px;
    .chart-box { height: 300px; width: 100%; }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.todo-list {
  .empty-state { text-align: center; padding: 40px 0; color: $color-text-secondary; font-size: $font-size-base; }
  
  .todo-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid $color-border-light;
    cursor: pointer;
    transition: $transition-fast;
    
    &:last-child { border-bottom: none; }
    &:hover { background-color: rgba(64,158,255,0.03); border-radius: 4px; padding: 12px 8px; }
    
    .todo-badge { margin-right: 12px; }
    
    .todo-info {
      flex: 1;
      .todo-title { font-size: $font-size-base; color: $color-text-primary; display: block; }
      .todo-desc { font-size: $font-size-small; color: $color-text-secondary; display: block; margin-top: 2px; }
    }
  }
}

.quick-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  
  .quick-item {
    flex: 1;
    min-width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: $transition-fast;
    
    &:hover { background-color: $color-bg; }
    
    .quick-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }
    
    .quick-title { font-size: $font-size-small; color: $color-text-regular; }
  }
}
</style>