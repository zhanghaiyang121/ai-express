<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDramaStore } from '../stores/drama'

const route = useRoute()
const router = useRouter()
const store = useDramaStore()
const id = route.params.id as string

const project = computed(() => store.projects.find(p => p.id === id))
if (!project.value) {
  router.replace('/projects')
}

const stats = computed(() => {
  const p = project.value
  if (!p) return null
  const totalScenes = p.episodes.reduce((sum, ep) => sum + ep.scenes.length, 0)
  const totalDuration = p.episodes.reduce((sum, ep) => sum + ep.scenes.reduce((s, sc) => s + sc.duration, 0), 0)
  const doneScenes = p.episodes.reduce((sum, ep) => sum + ep.scenes.filter(sc => sc.status === 'done').length, 0)
  const progress = totalScenes > 0 ? Math.round((doneScenes / totalScenes) * 100) : 0
  return { totalEpisodes: p.episodes.length, totalScenes, totalDuration, doneScenes, progress }
})

const quickLinks = [
  { path: `/project/${id}/script`, label: '剧本编辑器', icon: '✍️', desc: '编辑剧本对话和场景', color: '#6366f1' },
  { path: `/project/${id}/episodes`, label: '分集管理', icon: '📺', desc: '管理剧集和场景', color: '#10b981' },
  { path: `/project/${id}/characters`, label: '角色管理', icon: '👥', desc: '创建和管理角色', color: '#f59e0b' },
  { path: `/project/${id}/storyboard`, label: '分镜设计', icon: '🎬', desc: '设计拍摄分镜', color: '#ec4899' },
  { path: `/project/${id}/assets`, label: '素材管理', icon: '📁', desc: '管理项目素材', color: '#3b82f6' },
  { path: `/project/${id}/settings`, label: '项目设置', icon: '⚙️', desc: '配置项目参数', color: '#8b5cf6' },
]

const statusLabels: Record<string, string> = {
  draft: '草稿', 'in-progress': '制作中', completed: '已完成', published: '已发布'
}

function updateStatus(status: string) {
  if (project.value) {
    store.updateProject(id, { status: status as any })
  }
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}分${s}秒` : `${s}秒`
}
</script>

<template>
  <div class="project-home" v-if="project">
    <!-- Project Header -->
    <div class="project-banner" :style="{ background: `linear-gradient(135deg, hsl(${project.id.charCodeAt(0) * 3 % 360}, 50%, 40%), hsl(${project.id.charCodeAt(1) * 5 % 360}, 45%, 35%))` }">
      <div class="project-banner-content">
        <div>
          <div class="flex items-center gap-3" style="margin-bottom:8px;">
            <h1 style="font-size:28px;font-weight:700;color:white;">{{ project.title }}</h1>
            <span class="badge" style="background:rgba(255,255,255,0.2);color:white;font-size:12px;">
              {{ project.genre }}
            </span>
          </div>
          <p style="color:rgba(255,255,255,0.8);font-size:14px;max-width:600px;">
            {{ project.description || '暂无描述，点击右上角编辑项目信息' }}
          </p>
        </div>
        <select class="status-select" :value="project.status" @change="updateStatus(($event.target as HTMLSelectElement).value)">
          <option value="draft">📝 草稿</option>
          <option value="in-progress">🎬 制作中</option>
          <option value="completed">✅ 已完成</option>
          <option value="published">🚀 已发布</option>
        </select>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid" v-if="stats">
      <div class="stat-card">
        <div class="stat-icon" style="background:#e0e7ff;">📺</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalEpisodes }}</div>
          <div class="stat-label">剧集数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#d1fae5;">🎯</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalScenes }}</div>
          <div class="stat-label">场景数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fef3c7;">⏱️</div>
        <div class="stat-info">
          <div class="stat-value">{{ formatTime(stats.totalDuration) }}</div>
          <div class="stat-label">总时长</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#dbeafe;">📊</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.progress }}%</div>
          <div class="stat-label">完成度</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fce7f3;">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ project.characters.length }}</div>
          <div class="stat-label">角色数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#ede9fe;">📁</div>
        <div class="stat-info">
          <div class="stat-value">{{ project.assets.length }}</div>
          <div class="stat-label">素材数</div>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <h3 style="margin:24px 0 16px;font-size:16px;font-weight:600;">快捷入口</h3>
    <div class="quick-links">
      <router-link v-for="link in quickLinks" :key="link.path" :to="link.path" class="quick-link-card">
        <div class="quick-link-icon" :style="{ background: link.color + '15', color: link.color }">{{ link.icon }}</div>
        <div class="quick-link-label font-medium">{{ link.label }}</div>
        <div class="quick-link-desc text-xs text-tertiary">{{ link.desc }}</div>
      </router-link>
    </div>

    <!-- Recent Episodes -->
    <div class="flex items-center justify-between" style="margin:24px 0 16px;">
      <h3 style="font-size:16px;font-weight:600;">剧集列表</h3>
      <router-link :to="`/project/${id}/episodes`" class="text-sm" style="color:var(--primary);text-decoration:none;">管理剧集 →</router-link>
    </div>
    <div class="episode-list card" v-if="project.episodes.length > 0">
      <div class="episode-item" v-for="ep in project.episodes.slice(0, 5)" :key="ep.id">
        <div class="flex-1">
          <div class="font-medium">第 {{ ep.episodeNumber }} 集 · {{ ep.title }}</div>
          <div class="text-xs text-tertiary">{{ ep.scenes.length }} 个场景 · {{ ep.status === 'done' ? '已完成' : ep.status === 'editing' ? '剪辑中' : ep.status === 'shooting' ? '拍摄中' : ep.status === 'script' ? '剧本中' : '规划中' }}</div>
        </div>
        <span class="badge" :class="ep.status === 'done' ? 'badge-success' : ep.status === 'planning' ? 'badge-warning' : 'badge-info'">
          {{ ep.status === 'done' ? '完成' : ep.status === 'editing' ? '剪辑' : ep.status === 'shooting' ? '拍摄' : ep.status === 'script' ? '剧本' : '规划' }}
        </span>
      </div>
    </div>
    <div class="empty-state" v-else>
      <div class="empty-icon">📺</div>
      <div class="empty-title">还没有剧集</div>
      <div class="empty-desc">去分集管理页面添加您的第一集</div>
      <router-link :to="`/project/${id}/episodes`" class="btn btn-primary">前往分集管理</router-link>
    </div>

    <!-- Characters Preview -->
    <div class="flex items-center justify-between" style="margin:24px 0 16px;">
      <h3 style="font-size:16px;font-weight:600;">角色列表</h3>
      <router-link :to="`/project/${id}/characters`" class="text-sm" style="color:var(--primary);text-decoration:none;">管理角色 →</router-link>
    </div>
    <div class="character-chips" v-if="project.characters.length > 0">
      <div class="character-chip" v-for="char in project.characters.slice(0, 6)" :key="char.id">
        <div class="character-chip-avatar">{{ char.avatar || char.name.charAt(0) }}</div>
        <div class="text-sm font-medium">{{ char.name }}</div>
        <div class="text-xs text-tertiary">{{ char.role === 'protagonist' ? '主角' : char.role === 'antagonist' ? '反派' : char.role === 'supporting' ? '配角' : char.role === 'cameo' ? '客串' : '群众' }}</div>
      </div>
    </div>
    <div class="empty-state" v-else style="padding:30px;">
      <div class="empty-icon" style="font-size:32px;">👥</div>
      <div class="empty-title" style="font-size:14px;">还没有角色</div>
    </div>
  </div>
</template>

<style scoped>
.project-home { max-width: 1100px; margin: 0 auto; }
.project-banner {
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 24px;
}
.project-banner-content {
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}
.status-select {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.15);
  color: white;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}
.status-select option { color: var(--text-primary); }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 8px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.stat-value { font-size: 20px; font-weight: 700; }
.stat-label { font-size: 12px; color: var(--text-tertiary); }

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.quick-link-card {
  padding: 20px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.2s;
}
.quick-link-card:hover { border-color: var(--primary); box-shadow: var(--shadow-md); }
.quick-link-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 10px; }
.quick-link-label { margin-bottom: 4px; }

.episode-list { overflow: hidden; }
.episode-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-light);
}
.episode-item:last-child { border-bottom: none; }

.character-chips {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.character-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  min-width: 90px;
}
.character-chip-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
</style>