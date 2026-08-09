/**
 * 表格逻辑组合式函数
 * 职责：封装表格分页、加载、搜索、排序等通用逻辑
 */
import { ref, reactive } from 'vue'
import type { PageParams, PageResult } from '@/types'

interface TableOptions<T> {
  /** 数据获取函数 */
  fetchApi: (params: PageParams) => Promise<PageResult<T>>
  /** 默认每页条数 */
  defaultPageSize?: number
  /** 初始查询参数 */
  initialParams?: Record<string, unknown>
}

export function useTable<T>(options: TableOptions<T>) {
  const { fetchApi, defaultPageSize = 20, initialParams = {} } = options

  /** 表格数据 */
  const tableData = ref<T[]>([])
  /** 加载状态 */
  const loading = ref(false)
  /** 分页参数 */
  const pagination = reactive({
    page: 1,
    pageSize: defaultPageSize,
    total: 0
  })
  /** 查询参数 */
  const queryParams = reactive<Record<string, unknown>>({ ...initialParams })

  /**
   * 加载数据
   */
  async function loadData(): Promise<void> {
    loading.value = true
    try {
      const params: PageParams = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...queryParams
      }
      const result = await fetchApi(params)
      tableData.value = result.list
      pagination.total = result.total
    } catch (error) {
      console.error('[useTable] 加载数据失败:', error)
      tableData.value = []
      pagination.total = 0
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索（重置到第一页）
   */
  function handleSearch(params?: Record<string, unknown>): void {
    if (params) {
      Object.assign(queryParams, params)
    }
    pagination.page = 1
    loadData()
  }

  /**
   * 重置搜索条件
   */
  function handleReset(): void {
    Object.keys(queryParams).forEach((key) => {
      if (key in initialParams) {
        queryParams[key] = initialParams[key]
      } else {
        delete queryParams[key]
      }
    })
    pagination.page = 1
    loadData()
  }

  /**
   * 切换每页条数
   */
  function handleSizeChange(size: number): void {
    pagination.pageSize = size
    pagination.page = 1
    loadData()
  }

  /**
   * 切换页码
   */
  function handlePageChange(page: number): void {
    pagination.page = page
    loadData()
  }

  /**
   * 刷新当前页
   */
  function refresh(): void {
    loadData()
  }

  return {
    tableData,
    loading,
    pagination,
    queryParams,
    loadData,
    handleSearch,
    handleReset,
    handleSizeChange,
    handlePageChange,
    refresh
  }
}