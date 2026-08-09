<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDramaStore } from '../stores/drama'

const route = useRoute()
const store = useDramaStore()
const id = route.params.id as string

const project = computed(() => store.projects.find(p => p.id === id))
const selectedEpisodeId = ref('')
const selectedSceneId = ref('')
const showAddFrame = ref(false)
const newFrame = ref({ image: '', description: '', shotType: 'medium', duration: 5, notes: '' })

const selectedEpisode = computed(() => project.value?.episodes.find(e => e.id === selectedEpisodeId.value))
const selectedScene = computed(() => selectedEpisode.value?.scenes.find(s => s.id === selectedSceneId.value))

const storyboardFrames = ref<{ id: string; image: string; description: string; shotType: string; duration: number; notes: string; order: number }[]>([])

let frameCounter = 0
function addFrame() {
  storyboardFrames.value.push({
    id: `frame-${++frameCounter}`,
    image: newFrame.value.image || '',
    description: newFrame.value.description || `镜头 ${storyboardFrames.value.length + 1}`,
    shotType: newFrame.value.shotType,
    duration: newFrame.value.duration,
    notes: newFrame.value.notes,
    order: storyboardFrames.value.length + 1
  })
  newFrame.value = { image: '', description: '', shotType: 'medium', duration: 5, notes: '' }
  showAddFrame.value = false
}

function deleteFrame(id: string) {
  storyboardFrames.value = storyboardFrames.value.filter(f => f.id !== id)
}

function moveFrameUp(index: number) {
  if (index > 0) {
    const temp = storyboardFrames.value[index]
    storyboardFrames.value[index] = storyboardFrames.value[index - 1]
    storyboardFrames.value[index - 1] = temp
  }
}

function moveFrameDown(index: number) {
  if (index < storyboardFrames.value.length - 1) {
    const temp = storyboardFrames.value[index]
    storyboardFrames.value[index] = storyboardFrames.value[index + 1]
    storyboardFrames.value[index + 1] = temp
  }
}

function totalDuration() {
  return storyboardFrames.value.reduce((sum, f) => sum + f.duration, 0)
}

function exportStoryboard() {
  if (!project.value || !selectedScene.value) return
  let md = `# 分镜表 - ${project.value.title}\n`
  md += `## ${selectedEpisode.value?.title} - ${selectedScene.value.title}\n\n`
  storyboardFrames.value.forEach(f => {
    md += `### ${f.order}. ${f.description}\n`
    md += `- 镜头: ${f.shotType}\n- 时长: ${f.duration}s\n`
    if (f.notes) md += `- 备注: ${f.notes}\n`
    md += '\n'
  })
  const blob = new Blob([md], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `storyboard-${selectedScene.value.title}.md`
  a.click()
  URL.revokeObjectURL(url)
}

const shotColors: Record<string, string> = {
  wide: '#3b82f6', medium: '#10b981', 'close-up': '#f59e0b', 'extreme-close-up': '#ef4444',
  aerial: '#8b5cf6', pan: '#06b6d4', tilt: '#ec4899', tracking: '#f97316', pov: '#6366f1'
}
</script>

<template>
  <div v-if="project">
    <div class="flex items-center justify-between" style="margin-bottom:20px;">
      <h2 class="text-xl font-bold">🎬 分镜设计</h2>
      <button class="btn btn-outline" @click="exportStoryboard" :disabled="storyboardFrames.length === 0">📤 导出分镜表</button>
    </div>

    <!-- Select Episode & Scene -->
    <div class="flex gap-3" style="margin-bottom:20px;flex-wrap:wrap;">
      <select class="input" v-model="selectedEpisodeId" style="flex:1;min-width:180px;">
        <option value="">-- 选择剧集 --</option>
        <option v-for="ep in project.episodes" :key="ep.id" :value="ep.id">第{{ ep.episodeNumber }}集 - {{ ep.title }}</option>
      </select>
      <select class="input" v-model="selectedSceneId" style="flex:1;min-width:180px;" :disabled="!selectedEpisodeId">
        <option value="">-- 选择场景 --</option>
        <option v-for="sc in selectedEpisode?.scenes || []" :key="sc.id" :value="sc.id">场景{{ sc.sceneNumber }}: {{ sc.title }}</option>
      </select>
    </div>

    <!-- Scene Info -->
    <div class="card" v-if="selectedScene" style="padding:14px 20px;margin-bottom:16px;background:var(--bg-primary);">
      <div class="flex items-center gap-3 text-sm">
        <span class="font-semibold">{{ selectedScene.title }}</span>
        <span class="text-tertiary">|</span>
        <span>📍 {{ selectedScene.location || '未设置' }}</span>
        <span class="text-tertiary">|</span>
        <span>{{ selectedScene.interior ? '🏠 内景' : '🏞️ 外景' }}</span>
        <span class="text-tertiary">|</span>
        <span>⏱️ {{ selectedScene.duration }}s</span>
      </div>
    </div>

    <!-- Storyboard Grid -->
    <div v-if="selectedSceneId">
      <div class="flex items-center justify-between" style="margin-bottom:12px;">
        <span class="text-sm text-secondary">分镜帧 ({{ storyboardFrames.length }}) · 总时长: {{ totalDuration() }}s</span>
        <button class="btn btn-primary btn-sm" @click="showAddFrame = true">+ 添加分镜</button>
      </div>

      <div class="storyboard-grid" v-if="storyboardFrames.length > 0">
        <div v-for="(frame, index) in storyboardFrames" :key="frame.id" class="frame-card card">
          <div class="frame-number" :style="{ background: shotColors[frame.shotType] || '#6366f1' }">{{ frame.order }}</div>
          <div class="frame-preview">
            <div class="frame-placeholder" :style="{ borderColor: shotColors[frame.shotType] || '#6366f1' }">
              <span style="font-size:32px;">🎥</span>
              <span class="text-xs text-tertiary" style="margin-top:4px;">{{ frame.shotType }}</span>
            </div>
          </div>
          <div class="frame-info">
            <div class="font-medium text-sm">{{ frame.description }}</div>
            <div class="text-xs text-tertiary" style="margin:4px 0;">
              {{ frame.shotType }} · {{ frame.duration }}s
            </div>
            <div class="text-xs text-secondary" v-if="frame.notes">{{ frame.notes }}</div>
          </div>
          <div class="frame-actions">
            <button class="btn btn-ghost btn-sm" @click="moveFrameUp(index)" :disabled="index === 0">↑</button>
            <button class="btn btn-ghost btn-sm" @click="moveFrameDown(index)" :disabled="index === storyboardFrames.length - 1">↓</button>
            <button class="btn btn-ghost btn-sm" style="color:var(--danger);" @click="deleteFrame(frame.id)">🗑️</button>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else style="padding:40px;border:2px dashed var(--border);border-radius:var(--radius-md);">
        <div class="empty-icon">🎬</div>
        <div class="empty-title">开始设计分镜</div>
        <div class="empty-desc">为这个场景添加分镜帧，规划每个镜头的拍摄方式</div>
      </div>
    </div>

    <div class="empty-state card" v-else style="padding:60px;">
      <div class="empty-icon">👆</div>
      <div class="empty-title">选择一个场景开始设计分镜</div>
    </div>

    <!-- Add Frame Modal -->
    <div class="modal-overlay" v-if="showAddFrame" @click.self="showAddFrame = false">
      <div class="modal">
        <div class="modal-header"><h3>添加分镜帧</h3><button class="btn btn-ghost btn-icon" @click="showAddFrame = false">✕</button></div>
        <div class="modal-body">
          <div class="flex flex-col gap-3">
            <div class="flex gap-3">
              <div style="flex:1;"><label class="text-sm font-medium">镜头类型</label><select class="input" v-model="newFrame.shotType"><option value="wide">远景</option><option value="medium">中景</option><option value="close-up">特写</option><option value="extreme-close-up">大特写</option><option value="aerial">航拍</option><option value="pan">摇镜</option><option value="tracking">跟拍</option><option value="pov">主观</option></select></div>
              <div style="width:90px;"><label class="text-sm font-medium">时长(s)</label><input class="input" type="number" v-model.number="newFrame.duration" min="1" /></div>
            </div>
            <div><label class="text-sm font-medium">画面描述</label><textarea class="input" v-model="newFrame.description" placeholder="描述这个镜头内容..." rows="2"></textarea></div>
            <div><label class="text-sm font-medium">备注</label><input class="input" v-model="newFrame.notes" placeholder="拍摄注意事项..." /></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddFrame = false">取消</button>
          <button class="btn btn-primary" @click="addFrame">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.storyboard-grid {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 12px;
}
.frame-card {
  min-width: 220px;
  max-width: 250px;
  overflow: hidden;
  flex-shrink: 0;
}
.frame-number {
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  text-align: center;
}
.frame-preview { height: 140px; border-bottom: 1px solid var(--border-light); }
.frame-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 2px dashed var(--border);
  border-top: none;
}
.frame-info { padding: 10px 12px; }
.frame-actions {
  padding: 8px 12px;
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: 4px;
}
</style>