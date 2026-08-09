<template><div class="page-container"><el-card><template #header><div class="flex-between"><span class="page-title">商品分类</span><el-button type="primary" @click="handleAdd">新增分类</el-button></div></template><el-tree :data="treeData" node-key="id" default-expand-all :props="{ label:'name', children:'children' }"><template #default="{data}"><div class="tree-node"><span>{{data.name}}</span><span><el-button link type="primary" @click.stop="handleEdit(data)">编辑</el-button><el-button link type="danger" @click.stop="handleDelete(data)">删除</el-button></span></div></template></el-tree></el-card></div></template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
interface CategoryNode { id:number; name:string; children?:CategoryNode[] }
const treeData = ref<CategoryNode[]>([{id:1,name:'手机数码',children:[{id:11,name:'手机'},{id:12,name:'平板'}]},{id:2,name:'电脑办公',children:[{id:21,name:'笔记本'},{id:22,name:'台式机'}]}])
function handleAdd():void { ElMessage.info('新增分类') }
function handleEdit(data:CategoryNode):void { ElMessage.info('编辑: '+data.name) }
function handleDelete(data:CategoryNode):void { ElMessageBox.confirm('确认删除"'+data.name+'"?','警告',{type:'warning'}).then(()=>ElMessage.success('删除成功')) }
</script>