/**
 * 表单逻辑组合式函数
 * 职责：表单提交、校验、重置等通用逻辑
 */
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

interface FormOptions<T> {
  /** 初始表单数据 */
  initialData: T
  /** 表单提交函数，返回 true 表示成功 */
  submitFn: (formData: T) => Promise<boolean>
  /** 成功提示 */
  successMsg?: string
  /** 失败提示 */
  errorMsg?: string
}

export function useForm<T extends Record<string, unknown>>(options: FormOptions<T>) {
  const { initialData, submitFn, successMsg = '操作成功', errorMsg = '操作失败' } = options

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const isEdit = ref(false)

  /** 表单数据 */
  const formData = reactive<T>({ ...initialData }) as T

  /**
   * 重置表单
   */
  function resetForm(): void {
    Object.assign(formData, initialData)
    formRef.value?.resetFields()
    isEdit.value = false
  }

  /**
   * 设置编辑数据
   */
  function setFormData(data: T): void {
    Object.assign(formData, data)
    isEdit.value = true
  }

  /**
   * 提交表单
   */
  async function handleSubmit(formEl: FormInstance | undefined): Promise<boolean> {
    if (!formEl) {
      console.error('[useForm] formEl 未定义')
      return false
    }

    return new Promise((resolve) => {
      formEl.validate(async (valid) => {
        if (!valid) {
          ElMessage.warning('请先完善表单信息')
          resolve(false)
          return
        }

        loading.value = true
        try {
          const result = await submitFn({ ...formData } as T)
          if (result) {
            ElMessage.success(successMsg)
            resolve(true)
          } else {
            ElMessage.error(errorMsg)
            resolve(false)
          }
        } catch (error) {
          console.error('[useForm] 提交失败:', error)
          ElMessage.error(errorMsg)
          resolve(false)
        } finally {
          loading.value = false
        }
      })
    })
  }

  return {
    formRef,
    formData,
    loading,
    isEdit,
    resetForm,
    setFormData,
    handleSubmit
  }
}