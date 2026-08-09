<template>
  <div class="page-container">
    <el-card>
      <template #header><span class="page-title">文章编辑</span></template>
      <el-form label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" placeholder="请输入文章标题" /></el-form-item>
        <el-form-item label="分类"><el-select v-model="form.category" placeholder="请选择分类"><el-option label="营销活动" value="1" /><el-option label="产品动态" value="2" /></el-select></el-form-item>
        <el-form-item label="封面"><div class="upload-btn"><el-icon><Plus /></el-icon>上传封面</div></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="12" placeholder="请输入文章内容..." /></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSave">保存</el-button><el-button @click="handlePublish">发布</el-button></el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
const form = reactive({ title: '', category: '', content: '' })
function handleSave(): void { ElMessage.success('已保存为草稿') }
function handlePublish(): void { ElMessage.success('已发布') }
</script>
<style lang="scss" scoped>
.upload-btn { width:120px; height:120px; border:1px dashed #DCDFE6; border-radius:4px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; color:#909399; }
</style>