<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDramaStore } from '../stores/drama'
import type { Scene, Shot } from '../types'

const route = useRoute()
const store = useDramaStore()
const id = route.params.id as string

const project = computed(() => store.projects.find(p => p.id === id))
const selectedEpisodeId = ref('')
const showAddEpisode = ref(false)
const showAddScene = ref(false)
const showAddShot = ref(false)
const editingEpisode = ref({ title: '', notes: '' })
const newSceneData = ref({ title: '', location: '', timeOfDay: 'afternoon' as const, interior: true, description: '', duration: 60 })
const newShotData = ref({ type: 'medium' as const, angle: 'eye-level' as const, description: '', duration: 5 })
const selectedSceneId = ref('')

const selectedEpisode = computed(() => project.value?.episodes.find(e => e.id === selectedEpisodeId.value))

function addEpisode() {
  if (!editingEpisode.value.title.trim()) return
  store.addEpisode(id, editingEpisode.value)
  editingEpisode.value = { title: '', notes: '' }
  showAddEpisode.value = false
}

function deleteEpisode(epId: string) {
  if (confirm('确定要删除这一集吗？所有场景和台词将被删除。')) {
    store.deleteEpisode(id, epId)
    if (selectedEpisodeId.value === epId) selectedEpisodeId.value = ''
  }
}

function updateEpisodeStatus(epId: string, status: string) {
  store.updateEpisode(id, epId, { status: status as any })
}

function addScene() {
  if (!newSceneData.value.title.trim() || !selectedEpisodeId.value) return
  store.addScene(id, selectedEpisodeId.value, newSceneData.value)
  newSceneData.value = { title: '', location: '', timeOfDay: 'afternoon', interior: true, description: '', duration: 60 }
  showAddScene.value = false
}

function deleteScene(epId: string, sceneId: string) {
  if (confirm('确定删除此场景？')) store.deleteScene(id, epId, sceneId)
}

function addShot() {
  if (!selectedEpisodeId.value || !selectedSceneId.value) return
  store.addShot(id, selectedEpisodeId.value, selectedSceneId.value, newShotData.value)
  newShotData.value = { type: 'medium', angle: 'eye-level', description: '', duration: 5 }
  showAddShot.value = false
}

function deleteShot(epId: string, sceneId: string, shotId: string) {
  store.deleteShot(id, epId, sceneId, shotId)
}

function sortEpisodes() {
  if (!project.value) return
  project.value.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber)
  store.saveToStorage()
}

function formatTime(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60
  return m > 0 ? `${m}分${sec}秒` : `${sec}秒`
}

const statusMap: Record<string, string> = {
  planning: '📝 规划中', script: '✍️ 剧本', shooting: '🎥 拍摄中', editing: '✂️ 剪辑中', done: '✅ 完成'
}
</script>

<template>
  <div v-if="project">
    <div class="flex items-center justify-between" style="margin-bottom:20px;">
      <h2 class="text-xl font-bold">📺 分集管理</h2>
      <div class="flex gap-2">
        <button class="btn btn-secondary" @click="sortEpisodes">📊 排序</button>
        <button class="btn btn-primary" @click="showAddEpisode = true">+ 添加剧集</button>
      </div>
    </div>

    <div v-if="project.episodes.length === 0" class="empty-state card" style="padding:60px;">
      <div class="empty-icon">📺</div>
      <div class="empty-title">还没有剧集</div>
      <div class="empty-desc">点击上方按钮添加第一集</div>
    </div>

    <div v-for="ep in project.episodes" :key="ep.id" class="episode-card card" style="margin-bottom:16px;">
      <div class="card-header">
        <div class="flex items-center gap-3 flex-1">
          <span class="badge badge-primary">第{{ ep.episodeNumber }}集</span>
          <span class="font-semibold">{{ ep.title }}</span>
        </div>
        <div class="flex items-center gap-2">
          <select class="input" style="width:auto;padding:4px 28px 4px 8px;font-size:12px;" :value="ep.status" @change="updateEpisodeStatus(ep.id, ($event.target as HTMLSelectElement).value)">
            <option value="planning">规划中</option>
            <option value="script">剧本</option>
            <option value="shooting">拍摄中</option>
            <option value="editing">剪辑中</option>
            <option value="done">完成</option>
          </select>
          <button class="btn btn-danger btn-sm" @click="deleteEpisode(ep.id)">🗑️</button>
        </div>
      </div>
      <div class="card-body">
        <!-- Scenes -->
        <div class="flex items-center justify-between" style="margin-bottom:12px;">
          <span class="text-sm font-medium text-secondary">场景 ({{ ep.scenes.length }})</span>
          <button class="btn btn-primary btn-sm" @click="selectedEpisodeId = ep.id; showAddScene = true">+ 场景</button>
        </div>
        <div v-if="ep.scenes.length === 0" class="text-sm text-tertiary" style="padding:16px;text-align:center;">暂无场景</div>
        <div v-for="sc in ep.scenes" :key="sc.id" class="scene-item" style="border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;overflow:hidden;">
          <div class="flex items-center justify-between" style="padding:10px 14px;background:var(--bg-secondary);cursor:pointer;" @click="selectedSceneId = selectedSceneId === sc.id ? '' : sc.id; selectedEpisodeId = ep.id">
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium">场景{{ sc.sceneNumber }}: {{ sc.title }}</span>
              <span class="text-xs text-tertiary">{{ sc.location || '无地点' }}</span>
              <span class="text-xs text-tertiary">{{ formatTime(sc.duration) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge" :class="sc.status === 'done' ? 'badge-success' : sc.status === 'in-progress' ? 'badge-info' : 'badge-warning'">{{ sc.status === 'done' ? '完成' : sc.status === 'in-progress' ? '进行中' : '待办' }}</span>
              <button class="btn btn-ghost btn-sm" style="color:var(--danger);" @click.stop="deleteScene(ep.id, sc.id)">✕</button>
            </div>
          </div>
          <!-- Expanded Shots -->
          <div v-if="selectedSceneId === sc.id" style="padding:14px;border-top:1px solid var(--border-light);">
            <div class="flex items-center justify-between" style="margin-bottom:8px;">
              <span class="text-xs font-semibold text-tertiary">🎥 镜头列表 ({{ sc.shots.length }})</span>
              <button class="btn btn-outline btn-sm" @click="selectedEpisodeId = ep.id; selectedSceneId = sc.id; showAddShot = true">+ 镜头</button>
            </div>
            <div v-if="sc.shots.length === 0" class="text-xs text-tertiary" style="padding:8px;">暂无镜头设计</div>
            <div v-for="shot in sc.shots" :key="shot.id" class="flex items-center gap-2" style="padding:6px 8px;background:var(--bg-tertiary);border-radius:4px;margin-bottom:4px;">
              <span class="badge badge-info">{{ shot.shotNumber }}</span>
              <span class="text-xs">{{ shot.type }} · {{ shot.angle }}</span>
              <span class="text-xs text-tertiary flex-1 truncate">{{ shot.description }}</span>
              <span class="text-xs text-tertiary">{{ shot.duration }}s</span>
              <button class="btn btn-ghost btn-sm" style="color:var(--danger);font-size:10px;" @click="deleteShot(ep.id, sc.id, shot.id)">✕</button>
            </div>
            <!-- Scene description -->
            <div v-if="sc.description" style="margin-top:8px;padding:8px;background:var(--bg-tertiary);border-radius:4px;">
              <span class="text-xs text-tertiary">📝 {{ sc.description }}</span>
            </div>
            <div v-if="sc.dialogue.length > 0" style="margin-top:8px;">
              <span class="text-xs text-tertiary">💬 {{ sc.dialogue.length }} 句台词</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add Episode -->
    <div class="modal-overlay" v-if="showAddEpisode" @click.self="showAddEpisode = false">
      <div class="modal">
        <div class="modal-header"><h3>添加剧集</h3><button class="btn btn-ghost btn-icon" @click="showAddEpisode = false">✕</button></div>
        <div class="modal-body">
          <div class="flex flex-col gap-3">
            <div><label class="text-sm font-medium">剧集标题</label><input class="input" v-model="editingEpisode.title" placeholder="例如：命运的相遇" @keydown.enter="addEpisode" autofocus /></div>
            <div><label class="text-sm font-medium">备注</label><textarea class="input" v-model="editingEpisode.notes" placeholder="这一集的大纲或备注..." rows="2"></textarea></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddEpisode = false">取消</button>
          <button class="btn btn-primary" @click="addEpisode" :disabled="!editingEpisode.title.trim()">添加</button>
        </div>
      </div>
    </div>

    <!-- Modal: Add Scene -->
    <div class="modal-overlay" v-if="showAddScene" @click.self="showAddScene = false">
      <div class="modal">
        <div class="modal-header"><h3>添加场景</h3><button class="btn btn-ghost btn-icon" @click="showAddScene = false">✕</button></div>
        <div class="modal-body">
          <div class="flex flex-col gap-3">
            <div><label class="text-sm font-medium">场景标题</label><input class="input" v-model="newSceneData.title" placeholder="场景名称" @keydown.enter="addScene" autofocus /></div>
            <div><label class="text-sm font-medium">地点</label><input class="input" v-model="newSceneData.location" placeholder="拍摄地点" /></div>
            <div class="flex gap-3">
              <div style="flex:1;"><label class="text-sm font-medium">时段</label><select class="input" v-model="newSceneData.timeOfDay"><option value="dawn">黎明</option><option value="morning">上午</option><option value="afternoon">下午</option><option value="evening">傍晚</option><option value="night">夜晚</option></select></div>
              <div style="flex:1;"><label class="text-sm font-medium">场景类型</label><select class="input" v-model="newSceneData.interior"><option :value="true">🏠 内景</option><option :value="false">🏞️ 外景</option></select></div>
              <div style="flex:1;"><label class="text-sm font-medium">时长(秒)</label><input class="input" type="number" v-model.number="newSceneData.duration" min="1" /></div>
            </div>
            <div><label class="text-sm font-medium">描述</label><textarea class="input" v-model="newSceneData.description" rows="2" placeholder="场景内容简述..."></textarea></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddScene = false">取消</button>
          <button class="btn btn-primary" @click="addScene" :disabled="!newSceneData.title.trim()">添加</button>
        </div>
      </div>
    </div>

    <!-- Modal: Add Shot -->
    <div class="modal-overlay" v-if="showAddShot" @click.self="showAddShot = false">
      <div class="modal">
        <div class="modal-header"><h3>添加镜头</h3><button class="btn btn-ghost btn-icon" @click="showAddShot = false">✕</button></div>
        <div class="modal-body">
          <div class="flex flex-col gap-3">
            <div class="flex gap-3">
              <div style="flex:1;"><label class="text-sm font-medium">镜头类型</label><select class="input" v-model="newShotData.type"><option value="wide">远景</option><option value="medium">中景</option><option value="close-up">特写</option><option value="extreme-close-up">大特写</option><option value="aerial">航拍</option><option value="pan">摇镜</option><option value="tracking">跟拍</option><option value="pov">主观镜头</option></select></div>
              <div style="flex:1;"><label class="text-sm font-medium">角度</label><select class="input" v-model="newShotData.angle"><option value="eye-level">平视</option><option value="low">仰角</option><option value="high">俯角</option><option value="dutch">倾斜</option><option value="overhead">鸟瞰</option></select></div>
              <div style="width:80px;"><label class="text-sm font-medium">时长(秒)</label><input class="input" type="number" v-model.number="newShotData.duration" min="1" /></div>
            </div>
            <div><label class="text-sm font-medium">镜头描述</label><textarea class="input" v-model="newShotData.description" placeholder="这个镜头拍摄什么内容..." rows="2"></textarea></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddShot = false">取消</button>
          <button class="btn btn-primary" @click="addShot">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scene-item { transition: all 0.2s; }
.scene-item:hover { border-color: var(--primary); }
</style>