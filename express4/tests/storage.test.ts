import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from '@/utils/storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('set / get', () => {
    it('set 后再 get 返回相同的值', () => {
      storage.set('testKey', { name: 'hello' })
      const result = storage.get<{ name: string }>('testKey')
      expect(result).toEqual({ name: 'hello' })
    })

    it('get 不存在的 key 返回 null', () => {
      expect(storage.get('nonexistent')).toBeNull()
    })

    it('set 基本类型值', () => {
      storage.set('number', 42)
      expect(storage.get<number>('number')).toBe(42)
    })

    it('set 字符串值', () => {
      storage.set('string', 'hello world')
      expect(storage.get<string>('string')).toBe('hello world')
    })

    it('set 数组值', () => {
      storage.set('array', [1, 2, 3])
      expect(storage.get<number[]>('array')).toEqual([1, 2, 3])
    })

    it('set null 值', () => {
      storage.set('nullable', null)
      expect(storage.get('nullable')).toBeNull()
    })

    it('多次 set 同一 key 会被覆盖', () => {
      storage.set('key', 'first')
      storage.set('key', 'second')
      expect(storage.get('key')).toBe('second')
    })

    it('存储带前缀 EXPRESS4_ 到 localStorage', () => {
      storage.set('myKey', 'myValue')
      expect(localStorage.getItem('EXPRESS4_myKey')).toBe('"myValue"')
    })
  })

  describe('remove', () => {
    it('remove 后 get 返回 null', () => {
      storage.set('toRemove', 'value')
      storage.remove('toRemove')
      expect(storage.get('toRemove')).toBeNull()
    })

    it('remove 不存在的 key 不报错', () => {
      expect(() => storage.remove('noExist')).not.toThrow()
    })

    it('remove 只移除指定的 key', () => {
      storage.set('keep', 'keepValue')
      storage.set('remove', 'removeValue')
      storage.remove('remove')

      expect(storage.get('keep')).toBe('keepValue')
      expect(storage.get('remove')).toBeNull()
    })
  })

  describe('clear', () => {
    it('clear 清空所有带前缀的数据', () => {
      storage.set('a', 1)
      storage.set('b', 2)
      storage.set('c', 3)

      storage.clear()

      expect(storage.get('a')).toBeNull()
      expect(storage.get('b')).toBeNull()
      expect(storage.get('c')).toBeNull()
    })

    it('clear 不影响不带前缀的数据', () => {
      localStorage.setItem('OTHER_key', 'should survive')
      storage.set('myData', 'value')

      storage.clear()

      expect(localStorage.getItem('OTHER_key')).toBe('should survive')
      expect(storage.get('myData')).toBeNull()
    })
  })

  describe('token 快捷方法', () => {
    it('setToken 后 getToken 返回相同值', () => {
      storage.setToken('my-jwt-token')
      expect(storage.getToken()).toBe('my-jwt-token')
    })

    it('getToken 无值时返回 null', () => {
      expect(storage.getToken()).toBeNull()
    })

    it('removeToken 后 getToken 返回 null', () => {
      storage.setToken('token-to-remove')
      storage.removeToken()
      expect(storage.getToken()).toBeNull()
    })

    it('token 存储在 EXPRESS4_token 中', () => {
      storage.setToken('the-token')
      expect(localStorage.getItem('EXPRESS4_token')).toBe('"the-token"')
    })
  })

  describe('边界情况', () => {
    it('存储深度嵌套对象', () => {
      const deep = { a: { b: { c: [1, 2, { d: 'e' }] } } }
      storage.set('deep', deep)
      expect(storage.get('deep')).toEqual(deep)
    })

    it('存储包含特殊字符的字符串', () => {
      storage.set('special', '你好世界 🌍!@#$%^&*()')
      expect(storage.get('special')).toBe('你好世界 🌍!@#$%^&*()')
    })

    it('存储空字符串', () => {
      storage.set('empty', '')
      expect(storage.get('empty')).toBe('')
    })

    it('存储大量数据', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `item-${i}` }))
      storage.set('large', largeArray)
      const result = storage.get<typeof largeArray>('large')
      expect(result).toHaveLength(1000)
      expect(result![0]).toEqual({ id: 0, name: 'item-0' })
    })
  })
})