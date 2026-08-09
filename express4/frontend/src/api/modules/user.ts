import request from '@/utils/request'
import type { ApiResponse, LoginParams, LoginResult, UserInfo, PaginationParams, PaginationData } from '@/types'

/**
 * 用户相关 API — 对接后端 /api/v1/auth 和 /api/v1/users
 */
export const userApi = {
  /** M01-01 登录 */
  login(params: LoginParams) {
    return request.post<ApiResponse<{ token: string; user: UserInfo }>>('/v1/auth/login', params)
  },

  /** M01-06 获取当前用户信息 */
  getUserInfo() {
    return request.get<ApiResponse<UserInfo>>('/v1/auth/me')
  },

  /** M02-01 获取用户列表（分页 + 搜索） */
  getUserList(params: PaginationParams & { keyword?: string; role?: string }) {
    return request.get<ApiResponse<PaginationData<UserInfo>>>('/v1/users', { params })
  },

  /** M02-02 获取用户详情 */
  getUserDetail(id: number) {
    return request.get<ApiResponse<UserInfo>>(`/v1/users/${id}`)
  },

  /** M02-04 更新用户信息 */
  updateUser(id: number, data: Partial<UserInfo>) {
    return request.put<ApiResponse<UserInfo>>(`/v1/users/${id}`, data)
  },

  /** M02-05 删除用户 */
  deleteUser(id: number) {
    return request.delete<ApiResponse<null>>(`/v1/users/${id}`)
  }
}