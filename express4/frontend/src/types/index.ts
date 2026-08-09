// ========== API 通用响应类型 ==========
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

// ========== 分页请求参数 ==========
export interface PaginationParams {
  page: number
  pageSize: number
}

// ========== 分页响应数据 ==========
export interface PaginationData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ========== 用户信息 ==========
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  role: string
}

// ========== 登录参数 ==========
export interface LoginParams {
  username: string
  password: string
}

// ========== 登录响应 ==========
export interface LoginResult {
  token: string
  user: UserInfo
}
