import request from '@/utils/request'
import type { ApiResponse, LoginParams, LoginResult, UserInfo, PaginationParams, PaginationData } from '@/types'

/**
 * 用户相关 API
 */
export const userApi = {
  /** 登录 */
  login(params: LoginParams) {
    return request.post<ApiResponse<LoginResult>>('/user/login', params)
  },

  /** 获取当前用户信息 */
  getUserInfo() {
    return request.get<ApiResponse<UserInfo>>('/user/info')
  },

  /** 获取用户列表（分页） */
  getUserList(params: PaginationParams) {
    return request.get<ApiResponse<PaginationData<UserInfo>>>('/user/list', { params })
  },

  /** 更新用户信息 */
  updateUser(id: number, data: Partial<UserInfo>) {
    return request.put<ApiResponse<null>>(`/user/${id}`, data)
  },

  /** 删除用户 */
  deleteUser(id: number) {
    return request.delete<ApiResponse<null>>(`/user/${id}`)
  }
}