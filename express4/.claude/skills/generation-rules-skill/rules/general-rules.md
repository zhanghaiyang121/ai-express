# 通用代码生成规则集（框架无关）

## 安全规则

### XSS 防护
```
❌ 禁止 v-html 渲染用户输入
✅ 使用 v-text 或 {{ }} 插值
✅ 富文本内容必须经过 DOMPurify 消毒
```

### 敏感信息
```
❌ 禁止硬编码 API Key、密码、Token
✅ 使用环境变量 import.meta.env.VITE_*
✅ 前端只存非敏感信息（用户名），Token 存 httpOnly Cookie
```

### 输入校验
```
✅ 表单必须前端 + 后端双重校验
✅ 使用 vee-validate / async-validator
✅ 校验失败给出明确提示
```

---

## TypeScript 规则

### 类型安全
```typescript
// ❌ 禁止 any
const data: any = fetchData()

// ✅ 使用 unknown + 类型收窄
const data: unknown = fetchData()
if (isUserInfo(data)) {
  // data 现在是 UserInfo 类型
}

// ✅ 类型守卫函数
function isUserInfo(val: unknown): val is UserInfo {
  return typeof val === 'object' && val !== null && 'id' in val
}
```

### 类型定义
```typescript
// ✅ 业务实体用 interface
interface UserInfo {
  id: string
  name: string
  role: 'admin' | 'user'
}

// ✅ 工具类型用 type
type StatusType = 'active' | 'inactive'
type Paginated<T> = { list: T[]; total: number }

// ✅ API 响应统一结构
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
```

---

## 错误处理规则

### 异步操作
```typescript
// ✅ 必须有 try/catch/finally
async function fetchData() {
  loading.value = true
  try {
    return await api.getData()
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}
```

### Promise 处理
```typescript
// ✅ Promise.all 必须处理单个失败
const results = await Promise.allSettled([
  fetchUsers(),
  fetchProducts(),
])
// 分别处理成功和失败的结果

// ❌ 不要这样（一个失败全部失败）
const [users, products] = await Promise.all([
  fetchUsers(),
  fetchProducts(),
])
```

---

## 性能规则

### 响应式优化
```typescript
// ✅ 大对象用 shallowRef
const bigTableData = shallowRef<RowData[]>([])

// ✅ 不需要响应式的数据用 markRaw
constchartInstance = markRaw(echarts.init(el))

// ✅ 频繁操作的数据独立 ref
const searchQuery = ref('')
const searchResults = ref([])
```

### 渲染优化
```
✅ v-once — 静态内容只渲染一次
✅ v-memo — 条件缓存渲染
✅ v-show — 频繁切换显示/隐藏
✅ v-if — 条件很少改变的内容
✅ key — 强制重新渲染（切换不同组件时）
```

### 资源清理
```typescript
// ✅ 组件卸载时清理
onMounted(() => {
  const timer = setInterval(fn, 1000)
  window.addEventListener('resize', handleResize)
  
  onUnmounted(() => {
    clearInterval(timer)
    window.removeEventListener('resize', handleResize)
  })
})
```

---

## 文件组织规则

### 目录结构
```
src/
├── components/     # 通用组件
├── pages/          # 页面（按路由组织）
├── composables/    # 组合式函数
├── stores/         # 状态管理
├── api/            # 接口请求
├── types/          # 类型定义
├── utils/          # 工具函数
├── styles/         # 全局样式
└── assets/         # 静态资源
```

### 文件大小
```
✅ 单个文件不超过 300 行
✅ 超过 300 行考虑拆分
✅ 组件 > 200 行考虑拆分逻辑到 composable
```

### 导入顺序
```typescript
// 1. 类型导入
import type { ... } from '...'

// 2. 第三方库
import { ... } from 'vue'
import { ... } from 'vue-router'

// 3. 内部模块（绝对路径）
import { ... } from '@/stores/...'
import { ... } from '@/api/...'

// 4. 相对路径导入
import { ... } from './components/...'
```
