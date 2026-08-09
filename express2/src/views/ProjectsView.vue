<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDramaStore } from '../stores/drama'

const quickTemplates = [
  { name: '总裁复仇', icon: '💼', desc: '都市商战复仇', genre: '都市' },
  { name: '穿越逆袭', icon: '⏳', desc: '古代穿越类', genre: '穿越' },
  { name: '甜宠爱情', icon: '💕', desc: '现代爱情剧', genre: '爱情' },
  { name: '悬疑探案', icon: '🔍', desc: '推理悬疑类', genre: '悬疑' },
  { name: '校园青春', icon: '🏫', desc: '校园成长类', genre: '校园' },
]

const router = useRouter()
const store = useDramaStore()
const showCreateModal = ref(false)
const showImportModal = ref(false)
const newProjectTitle = ref('')
const newProjectGenre = ref('现代')
const searchQuery = ref('')
const importJson = ref('')
const filterGenre = ref('all')
const filterStatus = ref('all')
const toastMessage = ref('')
const toastVisible = ref(false)

const genres = ['现代', '古装', '悬疑', '爱情', '喜剧', '科幻', '奇幻', '都市', '校园', '穿越', '复仇', '逆袭']

function showToast(msg: string) {
  toastMessage.value = msg
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 2500)
}

const filteredProjects = computed(() => {
  let list = store.projects
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }
  if (filterGenre.value !== 'all') {
    list = list.filter(p => p.genre === filterGenre.value)
  }
  if (filterStatus.value !== 'all') {
    list = list.filter(p => p.status === filterStatus.value)
  }
  return list
})

function createProject() {
  if (!newProjectTitle.value.trim()) return
  const project = store.createProject({
    title: newProjectTitle.value.trim(),
    genre: newProjectGenre.value
  })
  showCreateModal.value = false
  newProjectTitle.value = ''
  newProjectGenre.value = '现代'
  router.push(`/project/${project.id}`)
}

function deleteProject(id: string, title: string) {
  if (confirm(`确定要删除项目"${title}"吗？此操作不可撤销。`)) {
    store.deleteProject(id)
    showToast('项目已删除')
  }
}

function duplicateProject(id: string) {
  const project = store.duplicateProject(id)
  if (project) {
    showToast(`已复制项目: ${project.title}`)
    router.push(`/project/${project.id}`)
  }
}

function exportProject(id: string) {
  const json = store.exportProject(id)
  if (json) {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('项目已导出')
  }
}

function importProjectData() {
  if (!importJson.value.trim()) return
  const project = store.importProject(importJson.value)
  if (project) {
    showImportModal.value = false
    importJson.value = ''
    showToast(`已导入: ${project.title}`)
  } else {
    showToast('导入失败，请检查JSON格式')
  }
}

function openProject(id: string) {
  store.currentProjectId = id
  router.push(`/project/${id}`)
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function createFromTemplate(t: { name: string; genre: string; desc: string }) {
  const project = store.createProject({
    title: t.name + ' - 新项目',
    genre: t.genre,
    description: t.desc + '短剧'
  })
  showToast('基于模板创建成功')
  router.push(`/project/${project.id}`)
}

const statusLabels: Record<string, string> = {
  draft: '草稿', 'in-progress': '制作中', completed: '已完成', published: '已发布'
}
const statusColor: Record<string, string> = {
  draft: 'badge-warning', 'in-progress': 'badge-info', completed: 'badge-success', published: 'badge-primary'
}
const genreIcons: Record<string, string> = {
  '现代': '🏙️', '古装': '🏯', '悬疑': '🔍', '爱情': '💕', '喜剧': '😄',
  '科幻': '🚀', '奇幻': '🧙', '都市': '🌆', '校园': '🏫', '穿越': '⏳', '复仇': '⚔️', '逆袭': '📈'
}
</script>

<template>
  <div class="projects-page">
    <div class="projects-header">
      <div class="flex items-center gap-3">
        <div style="font-size:32px;">🎬</div>
        <div>
          <h1 class="text-2xl font-bold">短剧工坊</h1>
          <p class="text-sm text-secondary">专业的短剧创作与管理平台</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-secondary" @click="showImportModal = true">📥 导入项目</button>
        <button class="btn btn-primary" @click="showCreateModal = true">➕ 新建项目</button>
      </div>
    </div>

    <div class="projects-filters card" style="padding:16px 20px;margin-bottom:20px;">
      <div class="flex items-center gap-4" style="flex-wrap:wrap;">
        <div style="position:relative;flex:1;min-width:200px;max-width:320px;">
          <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);">🔍</span>
          <input class="input" v-model="searchQuery" placeholder="搜索项目名称或描述..." style="padding-left:32px;" />
        </div>
        <select class="input" v-model="filterGenre" style="width:120px;">
          <option value="all">全部类型</option>
          <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
        </select>
        <select class="input" v-model="filterStatus" style="width:120px;">
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="in-progress">制作中</option>
          <option value="completed">已完成</option>
          <option value="published">已发布</option>
        </select>
        <span class="text-sm text-tertiary">共 {{ filteredProjects.length }} 个项目</span>
      </div>
    </div>

    <div class="projects-grid" v-if="filteredProjects.length > 0">
      <div class="project-card card" v-for="project in filteredProjects" :key="project.id" @click="openProject(project.id)">
        <div class="project-card-cover">
          <div class="project-cover-bg" :style="{ background: `linear-gradient(135deg, hsl(${project.id.charCodeAt(0) * 3 % 360}, 60%, 55%), hsl(${project.id.charCodeAt(1) * 3 % 360}, 60%, 45%))` }">
            <span class="project-cover-icon">{{ genreIcons[project.genre] || '🎬' }}</span>
          </div>
          <span class="badge project-genre-badge" :class="statusColor[project.status]">
            {{ statusLabels[project.status] }}
          </span>
        </div>
        <div class="project-card-body">
          <h3 class="project-card-title truncate">{{ project.title }}</h3>
          <p class="project-card-desc text-sm text-secondary truncate" style="margin:6px 0;">
            {{ project.description || '暂无描述' }}
          </p>
          <div class="flex items-center gap-2 text-xs text-tertiary" style="margin-bottom:8px;">
            <span>{{ project.genre }}</span><span>·</span>
            <span>{{ project.episodes.length }} 集</span><span>·</span>
            <span>{{ project.characters.length }} 角色</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-tertiary">{{ formatDate(project.updatedAt) }}</span>
            <div class="flex gap-1" @click.stop>
              <button class="btn btn-ghost btn-sm" title="复制" @click="duplicateProject(project.id)">📋</button>
              <button class="btn btn-ghost btn-sm" title="导出" @click="exportProject(project.id)">📤</button>
              <button class="btn btn-ghost btn-sm" title="删除" @click="deleteProject(project.id, project.title)" style="color:var(--danger);">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <div class="empty-icon">🎬</div>
      <div class="empty-title">{{ searchQuery || filterGenre !== 'all' ? '没有找到匹配的项目' : '还没有创建任何项目' }}</div>
      <div class="empty-desc">{{ searchQuery || filterGenre !== 'all' ? '请尝试更换搜索条件' : '点击下方按钮创建您的第一个短剧项目' }}</div>
      <button class="btn btn-primary btn-lg" @click="showCreateModal = true" v-if="!searchQuery && filterGenre === 'all'">➕ 创建第一个项目</button>
    </div>

    <div class="card" style="margin-top:24px;padding:24px;">
      <div class="flex items-center justify-between" style="margin-bottom:16px;">
        <h3 class="text-lg font-semibold">🚀 快速开始</h3>
        <router-link to="/templates" class="text-sm" style="color:var(--primary);text-decoration:none;">查看全部模板 →</router-link>
      </div>
      <div class="template-quick-list">
        <div class="template-quick-card" v-for="t in quickTemplates" :key="t.name" @click="createFromTemplate(t)">
          <div class="template-quick-icon">{{ t.icon }}</div>
          <div class="template-quick-name text-sm font-medium">{{ t.name }}</div>
          <div class="template-quick-desc text-xs text-tertiary">{{ t.desc }}</div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showCreateModal" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header"><h3>创建新项目</h3><button class="btn btn-ghost btn-icon" @click="showCreateModal = false">✕</button></div>
        <div class="modal-body">
          <div class="flex flex-col gap-4">
            <div><label class="text-sm font-medium" style="display:block;margin-bottom:6px;">项目名称 *</label><input class="input" v-model="newProjectTitle" placeholder="输入短剧名称..." @keydown.enter="createProject" autofocus /></div>
            <div><label class="text-sm font-medium" style="display:block;margin-bottom:6px;">类型</label><select class="input" v-model="newProjectGenre"><option v-for="g in genres" :key="g" :value="g">{{ g }}</option></select></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateModal = false">取消</button>
          <button class="btn btn-primary" @click="createProject" :disabled="!newProjectTitle.trim()">创建项目</button>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showImportModal" @click.self="showImportModal = false">
      <div class="modal">
        <div class="modal-header"><h3>导入项目</h3><button class="btn btn-ghost btn-icon" @click="showImportModal = false">✕</button></div>
        <div class="modal-body">
          <p class="text-sm text-secondary" style="margin-bottom:12px;">粘贴导出的项目JSON数据：</p>
          <textarea class="input" v-model="importJson" rows="6" placeholder='粘贴JSON数据...'></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showImportModal = false">取消</button>
          <button class="btn btn-primary" @click="importProjectData" :disabled="!importJson.trim()">导入</button>
        </div>
      </div>
    </div>

    <div class="toast-container" v-if="toastVisible">
      <div class="toast">{{ toastMessage }}</div>
    </div>
  </div>
</template>

<style scoped>
.projects-page { max-width: 1200px; margin: 0 auto; }
.projects-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.project-card { cursor: pointer; overflow: hidden; transition: all 0.2s; }
.project-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
.project-card-cover { position: relative; height: 140px; overflow: hidden; }
.project-cover-bg { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.project-cover-icon { font-size: 48px; opacity: 0.9; }
.project-genre-badge { position: absolute; top: 10px; right: 10px; }
.project-card-body { padding: 14px 16px; }
.project-card-title { font-size: 16px; font-weight: 600; }
.project-card-desc { height: 20px; }
.template-quick-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.template-quick-card { padding: 16px; border: 1px solid var(--border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; text-align: center; }
.template-quick-card:hover { border-color: var(--primary); background: var(--primary-light); }
.template-quick-icon { font-size: 32px; margin-bottom: 8px; }
.template-quick-name { margin-bottom: 4px; }
</style>