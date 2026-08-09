<template>
  <div class="page-container">
    <el-card>
      <template #header><div class="page-header"><span class="page-title">{{ isEdit ? '编辑商品' : '发布商品' }}</span></div></template>
      <el-steps :active="activeStep" align-center class="mb-24">
        <el-step title="基本信息" /><el-step title="规格属性" /><el-step title="商品详情" /><el-step title="运费模板" /><el-step title="确认发布" />
      </el-steps>
      <el-form v-show="activeStep===0" label-width="100px">
        <el-form-item label="商品名称" required><el-input v-model="form.name" placeholder="请输入商品名称" /></el-form-item>
        <el-form-item label="商品分类" required>
          <el-cascader v-model="form.category" :options="categoryOptions" placeholder="请选择分类" style="width:300px" />
        </el-form-item>
        <el-form-item label="品牌" required>
          <el-select v-model="form.brand" placeholder="请选择品牌" style="width:300px"><el-option label="苹果" value="apple" /><el-option label="华为" value="huawei" /></el-select>
        </el-form-item>
      </el-form>
      <div v-show="activeStep===1"><el-table :data="skuList" border><el-table-column prop="spec" label="规格" /><el-table-column label="价格"><template #default="{row}"><el-input-number v-model="row.price" :min="0" /></template></el-table-column><el-table-column label="库存"><template #default="{row}"><el-input-number v-model="row.stock" :min="0" /></template></el-table-column></el-table></div>
      <div v-show="activeStep===2"><el-input v-model="form.detail" type="textarea" :rows="10" placeholder="编辑商品详情..." /></div>
      <div v-show="activeStep===3"><el-radio-group v-model="form.freightType"><el-radio value="free">包邮</el-radio><el-radio value="template">运费模板</el-radio></el-radio-group></div>
      <div v-show="activeStep===4"><el-descriptions :column="2" border><el-descriptions-item label="商品名称">{{ form.name || '-' }}</el-descriptions-item><el-descriptions-item label="品牌">{{ form.brand || '-' }}</el-descriptions-item></el-descriptions></div>
      <div class="mt-24" style="text-align:center">
        <el-button v-if="activeStep>0" @click="activeStep--">上一步</el-button>
        <el-button v-if="activeStep<4" type="primary" @click="activeStep++">下一步</el-button>
        <el-button v-if="activeStep===4" type="primary" @click="handleSubmit">确认发布</el-button>
      </div>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
const router = useRouter(); const route = useRoute()
const activeStep = ref(0); const isEdit = computed(()=>!!route.query.id)
const form = reactive({ name:'', category:[] as string[], brand:'', detail:'', freightType:'free' })
const categoryOptions = [{ value:'digital', label:'手机数码', children:[{value:'phone',label:'手机'}] }]
const skuList = reactive([{ spec:'红', price:8999, stock:100 },{ spec:'蓝', price:8999, stock:80 }])
async function handleSubmit(): Promise<void> { await new Promise(r=>setTimeout(r,500)); ElMessage.success('发布成功'); router.push('/goods/list') }
</script>