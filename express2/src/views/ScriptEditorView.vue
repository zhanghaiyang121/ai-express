<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDramaStore } from '../stores/drama'
import type { Episode, Scene, DialogueLine } from '../types'

const route = useRoute()
const store = useDramaStore()
const id = route.params.id as string

const project = computed(() => store.projects.find(p => p.id === id))
const selectedEpisodeId = ref('')
const selectedSceneId = ref('')
const showAddScene = ref(false)
const showAddDialogue = ref(false)

const newScene = ref({ title: '', location: '', timeOfDay: 'afternoon' as const, interior: true, description: '' })
const newDialogue = ref({ characterName: '', text: '', emotion: '', notes: '' })

const selectedEpisode = computed(() => project.value?.episodes.find(e => e.id === selectedEpisodeId.value))
const selectedScene = computed(() => selectedEpisode.value?.scenes.find(s => s.id === selectedSceneId.value))

function selectEpisode(epId: string) {
  selectedEpisodeId.value = epId
  if (selectedEpisode.value?.scenes.length) {
    selectedSceneId.value = selectedEpisode.value.scenes[0].id
  } else {
    selectedSceneId.value = ''
  }
}

function addScene() {
  if (!newScene.value.title.trim() || !selectedEpisodeId.value) return
  store.addScene(id, selectedEpisodeId.value, newScene.value)
  // Refresh selection
  const ep = project.value?.episodes.find(e => e.id === selectedEpisodeId.value)
  if (ep?.scenes.length) {
    selectedSceneId.value = ep.scenes[ep.scenes.length - 1].id
  }
  newScene.value = { title: '', location: '', timeOfDay: 'afternoon', interior: true, description: '' }
  showAddScene.value = false
}

function addDialogue() {
  if (!newDialogue.value.text.trim() || !selectedSceneId.value || !selectedEpisodeId.value) return
  store.addDialogue(id, selectedEpisodeId.value, selectedSceneId.value, newDialogue.value)
  newDialogue.value = { characterName: '', text: '', emotion: '', notes: '' }
  showAddDialogue.value = false
}

function deleteScene(sceneId: string) {
  if (confirm('确定要删除这个场景吗？') && selectedEpisodeId.value) {
    store.deleteScene(id, selectedEpisodeId.value, sceneId)
    if (selectedSceneId.value === sceneId) {
      const ep = selectedEpisode.value
      selectedSceneId.value = ep?.scenes[0]?.id || ''
    }
  }
}

function deleteDialogue(dialogueId: string) {
  if (selectedEpisodeId.value && selectedSceneId.value) {
    store.deleteDialogue(id, selectedEpisodeId.value, selectedSceneId.value, dialogueId)
  }
}

function updateSceneField(field: string, value: any) {
  if (selectedEpisodeId.value && selectedSceneId.value) {
    store.updateScene(id, selectedEpisodeId.value, selectedSceneId.value, { [field]: value })
  }
}

function updateDialogueField(dialogueId: string, field: string, value: string) {
  if (selectedEpisodeId.value && selectedSceneId.value) {
    store.updateDialogue(id, selectedEpisodeId.value, selectedSceneId.value, dialogueId, { [field]: value })
  }
}

function exportScript() {
  if (!project.value) return
  let script = `# ${project.value.title}\n\n`
  for (const ep of project.value.episodes) {
    script += `## 第 ${ep.episodeNumber} 集 - ${ep.title}\n\n`
    for (const sc of ep.scenes) {
      script += `### 场景 ${sc.sceneNumber}: ${sc.title}\n`
      script += `📍 ${sc.location} | ${sc.interior ? '内景' : '外景'} | ${sc.timeOfDay}\n`
      script += `📝 ${sc.description}\n\n`
      for (const d of sc.dialogue) {
        script += `**${d.characterName}**${d.emotion ? `(${d.emotion})` : ''}: ${d.text}\n\n`
      }
    }
  }
  const blob = new Blob([script], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.value.title}-剧本.md`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="script-editor" v-if="project">
    <div class="flex items-center justify-between" style="margin-bottom:20px;">
      <h2 class="text-xl font-bold">✍️ 剧本编辑器</h2>
      <button class="btn btn-outline" @click="exportScript" :disabled="!project.episodes.length">📤 导出剧本</button>
    </div>

    <div class="script-layout" v-if="project.episodes.length > 0">
      <!-- Episode Selector -->
      <div class="episode-sidebar">
        <div class="text-sm font-semibold" style="padding:12px;color:var(--text-tertiary);">剧集列表</div>
        <div
          v-for="ep in project.episodes"
          :key="ep.id"
          class="episode-tab"
          :class="{ active: selectedEpisodeId === ep.id }"
          @click="selectEpisode(ep.id)"
        >
          <div class="ep-tab-num">第{{ ep.episodeNumber }}集</div>
          <div class="ep-tab-title">{{ ep.title }}</div>
          <div class="text-xs text-tertiary">{{ ep.scenes.length }}个场景</div>
        </div>
      </div>

      <!-- Scene Panel -->
      <div class="scene-panel" v-if="selectedEpisode">
        <div class="flex items-center justify-between" style="padding:12px 16px;border-bottom:1px solid var(--border-light);">
          <span class="font-semibold">场景列表</span>
          <button class="btn btn-primary btn-sm" @click="showAddScene = true">+ 场景</button>
        </div>
        <div
          v-for="sc in selectedEpisode.scenes"
          :key="sc.id"
          class="scene-tab"
          :class="{ active: selectedSceneId === sc.id }"
          @click="selectedSceneId = sc.id"
        >
          <div class="font-medium text-sm">场景 {{ sc.sceneNumber }}: {{ sc.title }}</div>
          <div class="text-xs text-tertiary">{{ sc.location || '未设置地点' }}</div>
          <span class="badge" :class="sc.status === 'done' ? 'badge-success' : sc.status === 'in-progress' ? 'badge-info' : 'badge-warning'">{{ sc.status === 'done' ? '✓' : sc.status === 'in-progress' ? '进行中' : '待办' }}</span>
        </div>
        <div class="empty-state" v-if="selectedEpisode.scenes.length === 0" style="padding:30px;">
          <div class="empty-icon" style="font-size:28px;">🎯</div>
          <div class="empty-title" style="font-size:13px;">还没有场景</div>
        </div>
      </div>

      <!-- Script Content -->
      <div class="script-content" v-if="selectedScene">
        <!-- Scene Header -->
        <div class="scene-header">
          <div class="flex items-center gap-3" style="margin-bottom:12px;">
            <input class="input" :value="selectedScene.title" @input="updateSceneField('title', ($event.target as HTMLInputElement).value)" style="font-size:18px;font-weight:600;flex:1;" />
            <button class="btn btn-ghost btn-sm" style="color:var(--danger);" @click="deleteScene(selectedScene.id)">🗑️</button>
          </div>
          <div class="scene-meta">
            <div class="meta-item">
              <label class="text-xs text-tertiary">地点</label>
              <input class="input input-sm" :value="selectedScene.location" @input="updateSceneField('location', ($event.target as HTMLInputElement).value)" placeholder="场景地点..." />
            </div>
            <div class="meta-item">
              <label class="text-xs text-tertiary">时间</label>
              <select class="input input-sm" :value="selectedScene.timeOfDay" @change="updateSceneField('timeOfDay', ($event.target as HTMLSelectElement).value)">
                <option value="dawn">🌅 黎明</option>
                <option value="morning">🌤️ 上午</option>
                <option value="afternoon">☀️ 下午</option>
                <option value="evening">🌇 傍晚</option>
                <option value="night">🌙 夜晚</option>
              </select>
            </div>
            <div class="meta-item">
              <label class="text-xs text-tertiary">场景</label>
              <select class="input input-sm" :value="selectedScene.interior ? 'interior' : 'exterior'" @change="updateSceneField('interior', ($event.target as HTMLSelectElement).value === 'interior')">
                <option value="interior">🏠 内景</option>
                <option value="exterior">🏞️ 外景</option>
              </select>
            </div>
            <div class="meta-item">
              <label class="text-xs text-tertiary">状态</label>
              <select class="input input-sm" :value="selectedScene.status" @change="updateSceneField('status', ($event.target as HTMLSelectElement).value)">
                <option value="todo">📝 待办</option>
                <option value="in-progress">✍️ 进行中</option>
                <option value="done">✅ 完成</option>
              </select>
            </div>
          </div>
          <div style="margin-top:12px;">
            <label class="text-xs text-tertiary">场景描述</label>
            <textarea class="input" :value="selectedScene.description" @input="updateSceneField('description', ($event.target as HTMLTextAreaElement).value)" placeholder="描述这个场景中发生的事情..." rows="3" style="margin-top:4px;"></textarea>
          </div>
        </div>

        <!-- Dialogue Lines -->
        <div class="dialogue-section">
          <div class="flex items-center justify-between" style="margin-bottom:12px;">
            <h4 class="font-semibold">💬 台词对话</h4>
            <button class="btn btn-primary btn-sm" @click="showAddDialogue = true">+ 添加台词</button>
          </div>

          <div class="dialogue-list" v-if="selectedScene.dialogue.length > 0">
            <div class="dialogue-item" v-for="dl in selectedScene.dialogue" :key="dl.id">
              <div class="dialogue-header flex items-center gap-2" style="margin-bottom:6px;">
                <input
                  class="input input-sm"
                  :value="dl.characterName"
                  @input="updateDialogueField(dl.id, 'characterName', ($event.target as HTMLInputElement).value)"
                  placeholder="角色名"
                  style="width:120px;font-weight:600;"
                />
                <select
                  class="input input-sm"
                  :value="dl.emotion"
                  @change="updateDialogueField(dl.id, 'emotion', ($event.target as HTMLSelectElement).value)"
                  style="width:110px;"
                >
                  <option value="">情绪...</option>
                  <option value="平静">😐 平静</option>
                  <option value="愤怒">😠 愤怒</option>
                  <option value="悲伤">😢 悲伤</option>
                  <option value="开心">😊 开心</option>
                  <option value="惊讶">😲 惊讶</option>
                  <option value="恐惧">😨 恐惧</option>
                  <option value="轻蔑">😏 轻蔑</option>
                  <option value="深情">🥰 深情</option>
                </select>
                <button class="btn btn-ghost btn-sm" style="color:var(--danger);margin-left:auto;" @click="deleteDialogue(dl.id)">✕</button>
              </div>
              <textarea
                class="input"
                :value="dl.text"
                @input="updateDialogueField(dl.id, 'text', ($event.target as HTMLTextAreaElement).value)"
                placeholder="输入台词..."
                rows="2"
              ></textarea>
            </div>
          </div>
          <div class="empty-state" v-else style="padding:30px;">
            <div class="empty-icon" style="font-size:28px;">💬</div>
            <div class="empty-title" style="font-size:13px;">还没有台词</div>
            <div class="empty-desc" style="font-size:12px;">点击上方按钮添加第一句台词</div>
          </div>
        </div>
      </div>
      <div class="empty-state script-content" v-else style="border:1px solid var(--border);border-radius:var(--radius-md);">
        <div class="empty-icon">👈</div>
        <div class="empty-title">选择一个场景开始编辑</div>
      </div>
    </div>

    <!-- Empty State - No Episodes -->
    <div class="empty-state card" v-else style="padding:60px;">
      <div class="empty-icon">📺</div>
      <div class="empty-title">还没有剧集</div>
      <div class="empty-desc">请先在分集管理中创建剧集和场景</div>
      <router-link :to="`/project/${id}/episodes`" class="btn btn-primary">前往分集管理</router-link>
    </div>

    <!-- Add Scene Modal -->
    <div class="modal-overlay" v-if="showAddScene" @click.self="showAddScene = false">
      <div class="modal">
        <div class="modal-header"><h3>添加场景</h3><button class="btn btn-ghost btn-icon" @click="showAddScene = false">✕</button></div>
        <div class="modal-body">
          <div class="flex flex-col gap-3">
            <div><label class="text-sm font-medium">场景标题</label><input class="input" v-model="newScene.title" placeholder="例如：办公室对峙" @keydown.enter="addScene" autofocus /></div>
            <div><label class="text-sm font-medium">地点</label><input class="input" v-model="newScene.location" placeholder="例如：总裁办公室" /></div>
            <div class="flex gap-3">
              <div style="flex:1;"><label class="text-sm font-medium">时段</label><select class="input" v-model="newScene.timeOfDay"><option value="dawn">黎明</option><option value="morning">上午</option><option value="afternoon">下午</option><option value="evening">傍晚</option><option value="night">夜晚</option></select></div>
              <div style="flex:1;"><label class="text-sm font-medium">场景</label><select class="input" v-model="newScene.interior"><option :value="true">内景</option><option :value="false">外景</option></select></div>
            </div>
            <div><label class="text-sm font-medium">描述</label><textarea class="input" v-model="newScene.description" placeholder="场景描述..." rows="2"></textarea></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddScene = false">取消</button>
          <button class="btn btn-primary" @click="addScene" :disabled="!newScene.title.trim()">添加</button>
        </div>
      </div>
    </div>

    <!-- Add Dialogue Modal -->
    <div class="modal-overlay" v-if="showAddDialogue" @click.self="showAddDialogue = false">
      <div class="modal">
        <div class="modal-header"><h3>添加台词</h3><button class="btn btn-ghost btn-icon" @click="showAddDialogue = false">✕</button></div>
        <div class="modal-body">
          <div class="flex flex-col gap-3">
            <div class="flex gap-3">
              <div style="flex:1;"><label class="text-sm font-medium">角色名</label><input class="input" v-model="newDialogue.characterName" placeholder="说话的角色" /></div>
              <div style="flex:1;"><label class="text-sm font-medium">情绪</label><select class="input" v-model="newDialogue.emotion"><option value="">无</option><option value="平静">平静</option><option value="愤怒">愤怒</option><option value="悲伤">悲伤</option><option value="开心">开心</option></select></div>
            </div>
            <div><label class="text-sm font-medium">台词内容</label><textarea class="input" v-model="newDialogue.text" placeholder="角色说的话..." rows="3" @keydown.ctrl.enter="addDialogue"></textarea></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddDialogue = false">取消</button>
          <button class="btn btn-primary" @click="addDialogue" :disabled="!newDialogue.text.trim()">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.script-editor { height: 100%; display: flex; flex-direction: column; }
.script-layout { flex: 1; display: flex; gap: 0; overflow: hidden; min-height: 0; }
.episode-sidebar {
  width: 180px;
  min-width: 180px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border);
  overflow-y: auto;
}
.episode-tab {
  padding: 10px 12px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.15s;
}
.episode-tab:hover { background: var(--bg-secondary); }
.episode-tab.active { background: var(--primary-light); border-left-color: var(--primary); }
.ep-tab-num { font-size: 12px; color: var(--primary); font-weight: 600; }
.ep-tab-title { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.scene-panel {
  width: 200px;
  min-width: 200px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border);
  overflow-y: auto;
}
.scene-tab {
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background 0.15s;
}
.scene-tab:hover { background: var(--bg-secondary); }
.scene-tab.active { background: var(--primary-light); }

.script-content { flex: 1; overflow-y: auto; padding: 20px; }
.scene-header { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
.scene-meta { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
.meta-item label { display: block; margin-bottom: 4px; }
.meta-item .input-sm { padding: 6px 10px; font-size: 13px; }

.dialogue-section { margin-top: 8px; }
.dialogue-list { display: flex; flex-direction: column; gap: 12px; }
.dialogue-item {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  transition: border-color 0.2s;
}
.dialogue-item:hover { border-color: var(--primary); }
</style>