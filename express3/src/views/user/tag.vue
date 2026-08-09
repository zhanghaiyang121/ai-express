<template><div class="page-container"><el-card><template #header><div class="flex-between"><span class="page-title">用户标签</span><el-button type="primary" @click="handleAdd">新增标签</el-button></div></template><el-table :data="tableData" stripe><el-table-column prop="name" label="标签名称" /><el-table-column prop="count" label="用户数" width="120" /><el-table-column prop="rule" label="自动规则" min-width="200" /><el-table-column label="操作" width="160" align="center"><template #default="{row}"><el-button link type="primary" @click="handleEdit(row)">编辑</el-button><el-button link type="danger">删除</el-button></template></el-table-column></el-table></el-card></div></template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const tableData = ref([{id:1,name:'高消费用户',count:1280,rule:'累计消费>¥10000'},{id:2,name:'活跃用户',count:5600,rule:'近30天登录>15次'},{id:3,name:'新注册',count:890,rule:'注册时间<7天'}])
function handleAdd():void { ElMessage.info('新增标签') }
function handleEdit(row:{name:string}):void { ElMessage.info('编辑: '+row.name) }
</script>