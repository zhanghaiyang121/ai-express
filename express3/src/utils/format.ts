/**
 * 格式化工具函数
 * 职责：金额、日期、数字等通用格式化
 */
import dayjs from 'dayjs'

/**
 * 格式化金额（分转元 + 千分位）
 * @param amount 金额（单位：分）
 * @param decimal 小数位数，默认2位
 */
export function formatMoney(amount: number | string | null | undefined, decimal = 2): string {
  if (amount === null || amount === undefined || amount === '') {
    return '0.00'
  }
  const num = Number(amount)
  if (Number.isNaN(num)) {
    return '0.00'
  }
  // 假设后端返回的是分，转为元
  const yuan = num / 100
  return yuan.toLocaleString('zh-CN', {
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal
  })
}

/**
 * 格式化日期
 * @param date 日期值
 * @param format 格式，默认 YYYY-MM-DD HH:mm:ss
 */
export function formatDate(date: string | number | Date | null | undefined, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) {
    return '-'
  }
  return dayjs(date).format(format)
}

/**
 * 格式化数字（千分位）
 * @param value 数值
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '0'
  }
  const num = Number(value)
  if (Number.isNaN(num)) {
    return '0'
  }
  return num.toLocaleString('zh-CN')
}

/**
 * 格式化手机号（中间4位隐藏）
 * @param phone 手机号
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone || phone.length < 11) {
    return phone || '-'
  }
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i]
}