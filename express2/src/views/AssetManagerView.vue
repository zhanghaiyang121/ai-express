<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDramaStore } from '../stores/drama'
import type { Asset } from '../types'

const route = useRoute()
const store = useDramaStore()
const id = route.params.id as string

const project = computed(() => store.projects.find(p => p.id === id))
const showAddModal = ref(false)
const showPreview = ref<Asset | null>(null)
const filterType = ref('all')
const searchQuery = ref('')

const newAsset = ref<{
  name: string
  type: 'image' | 'video' | 'audio' | 'script' | 'other'
  url: string
  thumbnail: string
  size: number
  duration?: number
  tags: string[]
}>({
  name: '', type: 'image', url: '', thumbnail: '',
  size: 0, duration: undefined, tags: []
})
const tagInput = ref('')

function addTag() {
  if (tagInput.value.trim()) {
    newAsset.value.tags.push(tagInput.value.trim())
    tagInput.value = ''
  }
}
function removeTag(i: number) { newAsset.value.tags.splice(i, 1) }

function addAsset() {
  if (!newAsset.value.name.trim()) return
  store.addAsset(id, { ...newAsset.value })
  newAsset.value = { name: '', type: 'image', url: '', thumbnail: '', size: 0, duration: undefined, tags: [] }
  showAddModal.value = false
}

function deleteAsset(assetId: string) {
  if (confirm('确定删除此素材？')) store.deleteAsset(id, assetId)
}

const filteredAssets = computed(() => {
  if (!project.value) return []
  let list = project.value.assets
  if (filterType.value !== 'all') list = list.filter(a => a.type === filterType.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(a => a.name.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q)))
  }
  return list
})

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1048576).toFixed(1) + 'MB'
}

const typeIcons: Record<string, string> = {
  image: '🖼️', video: '🎬', audio: '🎵', script: '📄', other: '📁'
}
const typeColors: Record<string, string> = {
  image: '#3b82f6', video: '#ef4444', audio: '#10b981', script: '#f59e0b', other: '#8b5cf6'
}
</script>

<template>
  <div v-if="project">
    <div class="flex items-center justify-between" style="margin-bottom:20px;">
      <h2 class="text-xl font-bold">📁 素材管理 ({{ project.assets.length }})</h2>
      <button class="btn btn-primary" @click="showAddModal = true">+ 添加素材</button>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3" style="margin-bottom:16px;flex-wrap:wrap;">
      <div style="position:relative;flex:1;min-width:180px;max-width:280px;">
        <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);">🔍</span>
        <input class="input" v-model="searchQuery" placeholder="搜索素材..." style="padding-left:32px;" />
      </div>
      <select class="input" v-model="filterType" style="width:130px;">
        <option value="all">全部类型</option>
        <option value="image">🖼️ 图片</option>
        <option value="video">🎬 视频</option>
        <option value="audio">🎵 音频</option>
        <option value="script">📄 剧本</option>
        <option value="other">📁 其他</option>
      </select>
    </div>

    <!-- Asset Grid -->
    <div class="asset-grid" v-if="filteredAssets.length > 0">
      <div v-for="asset in filteredAssets" :key="asset.id" class="asset-card card">
        <div class="asset-preview" :style="{ background: typeColors[asset.type] + '10' }" @click="showPreview = asset">
          <span style="font-size:40px;">{{ typeIcons[asset.type] }}</span>
          <span class="badge" style="position:absolute;top:8px;right:8px;background:var(--bg-primary);">{{ asset.type }}</span>
        </div>
        <div class="asset-body">
          <div class="font-medium text-sm truncate">{{ asset.name }}</div>
          <div class="text-xs text-tertiary">{{ formatSize(asset.size) }} · {{ new Date(asset.createdAt).toLocaleDateString('zh-CN') }}</div>
          <div class="flex gap-1 flex-wrap" style="margin-top:6px;" v-if="asset.tags.length > 0">
            <span v-for="t in asset.tags" :key="t" class="badge badge-info">{{ t }}</span>
          </div>
        </div>
        <div class="asset-footer">
          <button class="btn btn-ghost btn-sm" @click="showPreview = asset">👁️</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--danger);" @click="deleteAsset(asset.id)">🗑️</button>
        </div>
      </div>
    </div>

    <div class="empty-state card" v-else style="padding:60px;">
      <div class="empty-icon">📁</div>
      <div class="empty-title">{{ searchQuery || filterType !== 'all' ? '没有匹配的素材' : '还没有素材' }}</div>
      <div class="empty-desc">添加图片、视频、音频等素材到项目中</div>
    </div>

    <!-- Add Modal -->
    <div class="modal-overlay" v-if="showAddModal" @click.self="showAddModal = false">
      <div class="modal" style="max-width:480px;">
        <div class="modal-header"><h3>添加素材</h3><button class="btn btn-ghost btn-icon" @click="showAddModal = false">✕</button></div>
        <div class="modal-body">
          <div class="flex flex-col gap-3">
            <div><label class="text-sm font-medium">名称 *</label><input class="input" v-model="newAsset.name" placeholder="素材名称" autofocus /></div>
            <div class="flex gap-3">
              <div style="flex:1;"><label class="text-sm font-medium">类型</label><select class="input" v-model="newAsset.type"><option value="image">图片</option><option value="video">视频</option><option value="audio">音频</option><option value="script">剧本</option><option value="other">其他</option></select></div>
              <div style="width:100px;" v-if="newAsset.type === 'video' || newAsset.type === 'audio'">
                <label class="text-sm font-medium">时长(s)</label><input class="input" type="number" v-model.number="newAsset.duration" min="0" />
              </div>
            </div>
            <div><label class="text-sm font-medium">URL/路径</label><input class="input" v-model="newAsset.url" placeholder="素材文件路径或链接" /></div>
            <div><label class="text-sm font-medium">大小(字节)</label><input class="input" type="number" v-model.number="newAsset.size" placeholder="文件大小" /></div>
            <div>
              <label class="text-sm font-medium">标签</label>
              <div class="flex gap-2" style="margin-top:4px;">
                <input class="input" v-model="tagInput" @keydown.enter="addTag" placeholder="添加标签..." style="flex:1;" />
                <button class="btn btn-outline btn-sm" @click="addTag">添加</button>
              </div>
              <div class="flex gap-1 flex-wrap" style="margin-top:8px;" v-if="newAsset.tags.length">
                <span v-for="(t, i) in newAsset.tags" :key="i" class="badge badge-info" style="cursor:pointer;" @click="removeTag(i)">{{ t }} ✕</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary" @click="addAsset" :disabled="!newAsset.name.trim()">添加</button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div class="modal-overlay" v-if="showPreview" @click.self="showPreview = null">
      <div class="modal" style="max-width:600px;">
        <div class="modal-header">
          <h3>{{ showPreview.name }}</h3>
          <button class="btn btn-ghost btn-icon" @click="showPreview = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="flex flex-col gap-3">
            <div style="height:200px;background:var(--bg-secondary);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:64px;">
              {{ typeIcons[showPreview.type] }}
            </div>
            <div class="text-sm"><strong>类型:</strong> {{ showPreview.type }}</div>
            <div class="text-sm"><strong>大小:</strong> {{ formatSize(showPreview.size) }}</div>
            <div class="text-sm" v-if="showPreview.url"><strong>路径:</strong> {{ showPreview.url }}</div>
            <div class="text-sm" v-if="showPreview.duration"><strong>时长:</strong> {{ showPreview.duration }}s</div>
            <div class="flex gap-1 flex-wrap" v-if="showPreview.tags.length">
              <span v-for="t in showPreview.tags" :key="t" class="badge badge-info">{{ t }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.asset-card { overflow: hidden; }
.asset-preview {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}
.asset-body { padding: 10px 14px; }
.asset-footer {
  padding: 8px 14px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
</style>