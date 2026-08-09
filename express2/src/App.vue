<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDramaStore } from './stores/drama'

const route = useRoute()
const router = useRouter()
const store = useDramaStore()
const showCreateModal = ref(false)
const newProjectTitle = ref('')
const newProjectGenre = ref('现代')

const isHomePage = computed(() => route.name === 'Projects' || route.name === 'Templates')
const projectId = computed(() => route.params.id as string)
const currentProject = computed(() => store.currentProject)

const navItems = computed(() => {
  if (!projectId.value || isHomePage.value) return []
  return [
    { path: `/project/${projectId.value}`, label: '项目概览', icon: '📋' },
    { path: `/project/${projectId.value}/script`, label: '剧本编辑器', icon: '✍️' },
    { path: `/project/${projectId.value}/episodes`, label: '分集管理', icon: '📺' },
    { path: `/project/${projectId.value}/characters`, label: '角色管理', icon: '👥' },
    { path: `/project/${projectId.value}/storyboard`, label: '分镜设计', icon: '🎬' },
    { path: `/project/${projectId.value}/assets`, label: '素材管理', icon: '📁' },
    { path: `/project/${projectId.value}/settings`, label: '项目设置', icon: '⚙️' },
  ]
})

const genres = ['现代', '古装', '悬疑', '爱情', '喜剧', '科幻', '奇幻', '都市', '校园', '穿越', '复仇', '逆袭']

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

function goToProjects() {
  router.push('/projects')
}

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar" v-if="!isHomePage && currentProject">
      <div class="sidebar-header" @click="goToProjects">
        <div class="sidebar-logo">🎬</div>
        <div class="sidebar-brand">
          <div class="sidebar-brand-name">短剧工坊</div>
          <div class="sidebar-brand-sub">Drama Studio</div>
        </div>
      </div>
      <div class="sidebar-project">
        <div class="sidebar-project-title">{{ currentProject.title }}</div>
        <span class="badge" :class="{
          'badge-warning': currentProject.status === 'draft',
          'badge-info': currentProject.status === 'in-progress',
          'badge-success': currentProject.status === 'completed',
          'badge-primary': currentProject.status === 'published'
        }">
          {{ currentProject.status === 'draft' ? '草稿' : currentProject.status === 'in-progress' ? '制作中' : currentProject.status === 'completed' ? '已完成' : '已发布' }}
        </span>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/templates" class="nav-item">
          <span class="nav-icon">📋</span>
          <span class="nav-label">模板库</span>
        </router-link>
        <router-link to="/projects" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">项目列表</span>
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'no-sidebar': isHomePage }">
      <header class="top-header" v-if="!isHomePage && currentProject">
        <div class="header-left">
          <h1 class="header-title">{{ route.matched[route.matched.length - 1]?.name || '项目' }}</h1>
        </div>
        <div class="header-right">
          <button class="btn btn-outline btn-sm" @click="goToProjects">← 返回项目列表</button>
        </div>
      </header>
      <div class="page-container">
        <router-view />
      </div>
    </main>

    <!-- Create Project Modal -->
    <div class="modal-overlay" v-if="showCreateModal" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>创建新项目</h3>
          <button class="btn btn-ghost btn-icon" @click="showCreateModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="flex flex-col gap-4">
            <div>
              <label class="text-sm font-medium" style="display:block;margin-bottom:6px;">项目名称</label>
              <input
                class="input"
                v-model="newProjectTitle"
                placeholder="输入短剧名称..."
                @keydown.enter="createProject"
                autofocus
              />
            </div>
            <div>
              <label class="text-sm font-medium" style="display:block;margin-bottom:6px;">类型</label>
              <select class="input" v-model="newProjectGenre">
                <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateModal = false">取消</button>
          <button class="btn btn-primary" @click="createProject" :disabled="!newProjectTitle.trim()">创建项目</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--bg-primary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 100;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background var(--transition);
}
.sidebar-header:hover {
  background: var(--bg-secondary);
}
.sidebar-logo {
  font-size: 28px;
}
.sidebar-brand-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}
.sidebar-brand-sub {
  font-size: 11px;
  color: var(--text-tertiary);
}

.sidebar-project {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.sidebar-project-title {
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.sidebar-nav {
  padding: 8px;
  flex: 1;
}
.sidebar-footer {
  padding: 8px;
  border-top: 1px solid var(--border-light);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  transition: all var(--transition);
  margin-bottom: 2px;
}
.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
.nav-item.active {
  background: var(--primary-light);
  color: var(--primary-dark);
  font-weight: 600;
}
.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}
.nav-label {
  flex: 1;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.main-content.no-sidebar {
  max-width: 100%;
}

.top-header {
  height: var(--header-height);
  min-height: var(--header-height);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 50;
}
.header-title {
  font-size: 18px;
  font-weight: 600;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px;
    min-width: 64px;
  }
  .sidebar-brand-name,
  .sidebar-brand-sub,
  .sidebar-project-title,
  .sidebar-project .badge,
  .nav-label {
    display: none;
  }
  .sidebar-header {
    justify-content: center;
    padding: 14px;
  }
  .sidebar-project {
    justify-content: center;
  }
  .nav-item {
    justify-content: center;
  }
  .page-container {
    padding: 16px;
  }
  .top-header {
    padding: 0 16px;
  }
}
</style>