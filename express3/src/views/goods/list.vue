<template>
  <div class="page-container">
    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="queryParams" inline class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="queryParams.keyword" placeholder="商品名称/SKU/条码" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="queryParams.categoryId" placeholder="全部分类" clearable style="width:160px">
            <el-option label="手机数码" :value="1" />
            <el-option label="电脑办公" :value="2" />
            <el-option label="家用电器" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width:140px">
            <el-option label="在售" :value="1" />
            <el-option label="下架" :value="0" />
            <el-option label="售罄" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card mt-16">
      <template #header>
        <div class="flex-between">
          <div class="operate-btns">
            <el-button type="primary" @click="router.push('/goods/publish')">发布商品</el-button>
            <el-button :disabled="selectedIds.length === 0" @click="handleBatchStatus(1)">批量上架</el-button>
            <el-button :disabled="selectedIds.length === 0" @click="handleBatchStatus(0)">批量下架</el-button>
            <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchDelete">批量删除</el-button>
          </div>
          <el-button @click="handleExport">导出Excel</el-button>
        </div>
      </template>

      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        style="width:100%"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="商品信息" min-width="250">
          <template #default="{ row }">
            <div class="goods-info">
              <el-image :src="row.image" fit="cover" class="goods-thumb" />
              <div class="goods-text">
                <span class="goods-name text-ellipsis">{{ row.name }}</span>
                <span class="goods-sku">SKU: {{ row.sku }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120" align="center">
          <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" align="center" />
        <el-table-column prop="sales" label="销量" width="100" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push('/goods/publish?id=' + row.id)">编辑</el-button>
            <el-button link type="primary" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTable } from '@/composables/useTable'
import type { PageParams, PageResult } from '@/types'

const router = useRouter()
const selectedIds = ref<number[]>([])

interface GoodsItem {
  id: number
  name: string
  sku: string
  image: string
  price: number
  stock: number
  sales: number
  status: number
}

/** Mock 商品数据 */
const mockGoodsList: GoodsItem[] = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: ['iPhone 15 Pro Max', '华为 Mate 60 Pro', '小米14 Ultra', 'AirPods Pro 2', 'MacBook Pro 16'][i % 5] + (i > 4 ? ` (${Math.floor(i/5)})` : ''),
  sku: `SKU-${10000 + i}`,
  image: `https://picsum.photos/80/80?random=${i}`,
  price: [8999, 6999, 5999, 1299, 14999][i % 5],
  stock: [120, 85, 230, 450, 38][i % 5],
  sales: [8920, 7650, 5430, 12800, 3200][i % 5],
  status: [1, 1, 1, 1, 0][i % 5] as number
}))

const { tableData, loading, pagination, queryParams, handleSearch, handleReset, handleSizeChange, handlePageChange } = useTable<GoodsItem>({
  fetchApi: async (params: PageParams): Promise<PageResult<GoodsItem>> => {
    await new Promise((r) => setTimeout(r, 300))
    let list = [...mockGoodsList]
    const kw = (params.keyword as string || '').toLowerCase()
    if (kw) list = list.filter((g) => g.name.toLowerCase().includes(kw) || g.sku.toLowerCase().includes(kw))
    if (params.status !== undefined && params.status !== '') {
      list = list.filter((g) => g.status === Number(params.status))
    }
    const start = (params.page - 1) * params.pageSize
    return { list: list.slice(start, start + params.pageSize), total: list.length, page: params.page, pageSize: params.pageSize }
  }
})

function statusTag(status: number): 'success' | 'info' | 'danger' {
  return status === 1 ? 'success' : status === 2 ? 'danger' : 'info'
}

function statusLabel(status: number): string {
  return status === 1 ? '在售' : status === 2 ? '售罄' : '下架'
}

function handleSelectionChange(rows: GoodsItem[]): void {
  selectedIds.value = rows.map((r) => r.id)
}

function handleToggleStatus(row: GoodsItem): void {
  const action = row.status === 1 ? '下架' : '上架'
  ElMessageBox.confirm(`确认${action}该商品?`, '提示', { type: 'warning' }).then(() => {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.success(`${action}成功`)
  })
}

function handleBatchStatus(status: number): void {
  const label = status === 1 ? '上架' : '下架'
  ElMessage.success(`已批量${label} ${selectedIds.value.length} 个商品`)
}

function handleBatchDelete(): void {
  ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个商品?`, '警告', { type: 'error' }).then(() => {
    ElMessage.success(`已删除 ${selectedIds.value.length} 个商品`)
    selectedIds.value = []
  })
}

function handleDelete(id: number): void {
  ElMessageBox.confirm('确认删除该商品?', '警告', { type: 'error' }).then(() => {
    ElMessage.success('删除成功')
  })
}

function handleExport(): void {
  ElMessage.success('正在导出，请稍候...')
}

onMounted(() => { loadData(); })
const { loadData } = useTable<GoodsItem>({
  fetchApi: async () => ({ list: [], total: 0, page: 1, pageSize: 20 })
})
</script>

<style lang="scss" scoped>
.goods-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .goods-thumb {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .goods-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;

    .goods-name { font-size: $font-size-base; color: $color-text-primary; max-width: 180px; }
    .goods-sku { font-size: $font-size-small; color: $color-text-secondary; }
  }
}
</style>