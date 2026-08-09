/**
 * 校验工具函数
 */

/**
 * 校验中国大陆手机号码
 * @param phone - 待校验的手机号码字符串
 * @returns 是否为有效手机号
 *
 * 规则：
 * - 11 位数字
 * - 以 1 开头，第二位为 3-9
 * - 支持常见号段（130-199）
 *
 * @example
 * isValidPhone('13800138000')  // true
 * isValidPhone('12345678901')  // false
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 校验是否为有效手机号（兼容带空格、短横线等常见分隔符的格式）
 * 校验时会先移除空格和短横线，再按标准规则校验
 *
 * @param phone - 待校验的手机号码字符串（可含空格或短横线）
 * @returns 是否为有效手机号
 *
 * @example
 * isValidPhoneLoose('138-0013-8000')  // true
 * isValidPhoneLoose('138 0013 8000')  // true
 */
export function isValidPhoneLoose(phone: string): boolean {
  if (!phone) return false
  const cleaned = phone.replace(/[\s-]/g, '')
  return /^1[3-9]\d{9}$/.test(cleaned)
}