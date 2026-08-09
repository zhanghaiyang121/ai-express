<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { CreateOrderParams, CreateOrderItem } from '@/types/order'
import { PayMethodMap } from '@/types/order'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{ visible: boolean; loading: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void; (e: 'submit', data: CreateOrderParams): void }>()

const formRef = ref<FormInstance>()
const form = reactive<CreateOrderParams>({
  userId: 0,
  userName: '',
  items: [],
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  remark: '',
})

const rules: FormRules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
  receiverName: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  receiverPhone: [{ required: true, message: '请输入收货电话', trigger: 'blur' }],
  receiverAddress: [{ required: true, message: '请输入收货地址', trigger: 'blur' }],
}

const users = [
  { id: 2, name: '张三' },
  { id: 3, name: '李四' },
  { id: 4, name: '王五' },
  { id: 5, name: '赵六' },
]

function addItem() {
  form.items.push({ productName: '', skuSpec: '', price: 0, quantity: 1, productId: 0 })
}

function removeItem(index: number) {
  form.items.splice(index, 1)
}

function calcTotal() {
  return form.items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0)
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (form.items.length === 0) return
      emit('submit', { ...form })
    }
  })
}

function handleClose() {
  formRef.value?.resetFields()
  form.items = []
  form.remark = ''
  emit('update:visible', false)
}

function onUserChange(val: number) {
  const u = users.find(u => u.id === val)
  form.userName = u ? u.name : ''
}
</script>

<template>
  <el-dialog :model-value="visible" title="创建订单" width="700px" @close="handleClose" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="default">
      <el-form-item label="下单用户" prop="userId">
        <el-select v-model="form.userId" placeholder="请选择用户" @change="onUserChange" style="width: 200px">
          <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="商品列表" required>
        <div v-for="(_, idx) in form.items" :key="idx" class="item-row">
          <el-input v-model="form.items[idx].productName" placeholder="商品名" size="small" style="width: 160px" />
          <el-input v-model="form.items[idx].skuSpec" placeholder="规格" size="small" style="width: 120px" />
          <el-input-number v-model="form.items[idx].price" :min="0" :precision="2" placeholder="单价" size="small" style="width: 100px" controls-position="right" />
          <el-input-number v-model="form.items[idx].quantity" :min="1" :max="999" size="small" style="width: 80px" controls-position="right" />
          <span class="subtotal" v-if="form.items[idx].price">¥{{ (form.items[idx].price * form.items[idx].quantity).toFixed(2) }}</span>
          <el-button type="danger" size="small" link @click="removeItem(idx)">删除</el-button>
        </div>
        <el-button type="primary" size="small" link @click="addItem">+ 添加商品</el-button>
        <div v-if="form.items.length > 0" class="total-hint">总金额: ¥{{ calcTotal().toFixed(2) }}</div>
      </el-form-item>

      <el-form-item label="收货人" prop="receiverName">
        <el-input v-model="form.receiverName" placeholder="请输入收货人" />
      </el-form-item>
      <el-form-item label="收货电话" prop="receiverPhone">
        <el-input v-model="form.receiverPhone" placeholder="请输入收货电话" />
      </el-form-item>
      <el-form-item label="收货地址" prop="receiverAddress">
        <el-input v-model="form.receiverAddress" placeholder="请输入收货地址" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="订单备注（选填）" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">创建订单</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.item-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
.subtotal { font-weight: 600; color: #e74c3c; min-width: 80px; }
.total-hint { margin-top: 8px; font-weight: 600; color: #e74c3c; }
</style>