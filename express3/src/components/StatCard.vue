<template>
  <el-card class="stat-card" shadow="hover">
    <div class="stat-card__body">
      <div class="stat-card__info">
        <span class="stat-card__title">{{ title }}</span>
        <span class="stat-card__value">{{ formattedValue }}</span>
        <div v-if="trend !== undefined" class="stat-card__trend">
          <el-icon :color="trend >= 0 ? '#67C23A' : '#F56C6C'" :size="14">
            <CaretTop v-if="trend >= 0" />
            <CaretBottom v-else />
          </el-icon>
          <span :class="trend >= 0 ? 'up' : 'down'">
            {{ Math.abs(trend) }}%
          </span>
          <span class="trend-label">{{ trendLabel || '较昨日' }}</span>
        </div>
      </div>
      <div class="stat-card__icon" :style="{ backgroundColor: iconBg }">
        <el-icon :size="24" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'

const props = defineProps<{
  title: string
  value: number
  icon: object
  iconColor?: string
  iconBg?: string
  prefix?: string
  suffix?: string
  trend?: number
  trendLabel?: string
}>()

const formattedValue = computed(() => {
  const prefix = props.prefix || ''
  const suffix = props.suffix || ''
  const val = props.value.toLocaleString('zh-CN')
  return `${prefix}${val}${suffix}`
})
</script>

<style lang="scss" scoped>
.stat-card {
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.stat-card__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-card__info {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .stat-card__title {
    font-size: $font-size-base;
    color: $color-text-secondary;
  }

  .stat-card__value {
    font-size: 28px;
    font-weight: 600;
    color: $color-text-primary;
    line-height: 1.2;
  }

  .stat-card__trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: $font-size-small;

    .up { color: $color-success; }
    .down { color: $color-danger; }

    .trend-label {
      color: $color-text-secondary;
      margin-left: 4px;
    }
  }
}

.stat-card__icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}
</style>