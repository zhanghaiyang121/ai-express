<template><div class="page-container"><el-card><template #header><div class="flex-between"><span class="page-title">拼团活动</span><el-button type="primary" @click="handleAdd">创建活动</el-button></div></template><el-table :data="tableData" stripe><el-table-column prop="name" label="活动名称" /><el-table-column prop="rule" label="规则" min-width="200" /><el-table-column prop="time" label="活动时间" width="200" /><el-table-column label="状态" width="100"><template #default="{row}"><el-tag :type="row.status===1?'success':'info'" size="small">{{row.status===1?'进行中':'已结束'}}</el-tag></template></el-table-column><el-table-column label="操作" width="160" align="center"><template #default="{row}"><el-button link type="primary" @click="handleEdit(row)">编辑</el-button><el-button link type="danger">删除</el-button></template></el-table-column></el-table></el-card></div></template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
const tableData = ref([{id:1,name:'夏日拼团',rule:'3人成团/享8折',time:'2026-08-01~08-31',status:1},{id:2,name:'新品首发',rule:'5人成团/立减100',time:'2026-07-15~08-15',status:0}])
function handleAdd():void { ElMessage.info('创建拼团活动') }
function handleEdit(row:{name:string}):void { ElMessage.info('编辑: '+row.name) }
</script>