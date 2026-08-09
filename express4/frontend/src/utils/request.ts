import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { storage } from './storage'
import eventBus from './eventBus'
import type { ApiResponse } from '@/types'

/**
 * 创建 Axios 实例
 */
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 携带 Token
    const token = storage.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response

    // 根据业务状态码判断
    if (data.code !== 0 && data.code !== 200) {
      // 业务错误处理
      eventBus.emit('global:message', {
        type: 'error',
        content: data.message || '请求失败'
      })

      // Token 过期
      if (data.code === 401) {
        storage.removeToken()
        eventBus.emit('user:logout')
      }

      return Promise.reject(new Error(data.message || '请求失败'))
    }

    return response
  },
  (error) => {
    // HTTP 错误处理
    let message = '网络异常，请稍后重试'

    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 400:
          message = '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          storage.removeToken()
          eventBus.emit('user:logout')
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        default:
          message = `连接错误 ${status}`
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时'
    }

    eventBus.emit('global:message', { type: 'error', content: message })
    return Promise.reject(error)
  }
)

export default request