# Vue 3 代码生成规则集

## 强制规则

### 组件结构
```vue
<script setup lang="ts">
// 1. 类型导入
import type { UserInfo } from '@/types/api'

// 2. 第三方导入
import { ref, computed } from 'vue'

// 3. 内部模块导入
import { useUserStore } from '@/stores/user'

// 4. Props & Emits
interface Props {
  userId: string
}
const props = defineProps<Props>()
const emit = defineEmits<{
  update: [id: string]
}>()

// 5. 响应式状态
const loading = ref(false)

// 6. 计算属性
const displayName = computed(() => ...)

// 7. 方法
async function fetchData() { ... }

// 8. 生命周期
onMounted(() => fetchData())
</script>
```

### 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserCard.vue` |
| 组合函数 | camelCase + use 前缀 | `useTable.ts` |
| Props | camelCase | `userId` |
| Events | kebab-case | `@update-user` |
| 常量 | UPPER_SNAKE_CASE | `MAX_COUNT` |
| 类型/接口 | PascalCase | `UserInfo` |

### 禁止事项
- ❌ Options API
- ❌ any 类型
- ❌ var 声明
- ❌ v-html 渲染用户输入
- ❌ v-if 和 v-for 同元素
- ❌ index 作为 key
- ❌ 模板中复杂表达式
- ❌ 组件中直接调用 axios
- ❌ 硬编码颜色值
- ❌ !important（除非覆盖第三方）

---

## 推荐规则

### 函数设计
- 函数长度：≤ 50 行
- 参数数量：≤ 3 个（超过用对象）
- 嵌套深度：≤ 3 层
- 单一职责：一个函数只做一件事

### 响应式优化
- 大对象不需要深度响应式 → shallowRef
- 不需要响应式的静态数据 → markRaw
- 频繁变更的状态 → 独立 ref，避免大对象

### 性能优化
- 路由懒加载
- 图片懒加载
- 大列表虚拟滚动
- 频繁操作防抖/节流
- 按需引入组件

### 错误处理
```typescript
// ✅ 正确的错误处理
async function fetchData() {
  loading.value = true
  try {
    const { data } = await getUserList()
    tableData.value = data.list
  } catch (error) {
    if (error instanceof AxiosError) {
      ElMessage.error(error.message)
    } else {
      console.error('Unknown error:', error)
    }
  } finally {
    loading.value = false
  }
}

// ❌ 错误的错误处理
async function fetchData() {
  const { data } = await getUserList()  // 无 try/catch
  tableData.value = data.list
}
```
