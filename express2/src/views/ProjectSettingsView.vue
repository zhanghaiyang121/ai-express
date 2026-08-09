<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDramaStore } from '../stores/drama'

const route = useRoute()
const router = useRouter()
const store = useDramaStore()
const id = route.params.id as string

const project = computed(() => store.projects.find(p => p.id === id))
if (!project.value) router.replace('/projects')

const form = ref({
  title: project.value?.title || '',
  description: project.value?.description || '',
  genre: project.value?.genre || '现代',
  targetDuration: project.value?.targetDuration || 10,
  aspectRatio: project.value?.settings.aspectRatio || '16:9',
  resolution: project.value?.settings.resolution || '1080p',
  frameRate: project.value?.settings.frameRate || 24,
  language: project.value?.settings.language || 'zh-CN',
})

const saved = ref(false)

function save() {
  if (!project.value) return
  store.updateProject(id, {
    title: form.value.title,
    description: form.value.description,
    genre: form.value.genre,
    targetDuration: form.value.targetDuration,
    settings: {
      aspectRatio: form.value.aspectRatio as any,
      resolution: form.value.resolution as any,
      frameRate: form.value.frameRate as any,
      language: form.value.language,
    }
  })
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

function deleteCurrentProject() {
  if (window.confirm('确定要永久删除此项目吗？')) {
    store.deleteProject(id)
    router.push('/projects')
  }
}

const genres = ['现代', '古装', '悬疑', '爱情', '喜剧', '科幻', '奇幻', '都市', '校园', '穿越', '复仇', '逆袭']
</script>

<template>
  <div class="settings-page" v-if="project" style="max-width:700px;">
    <div class="flex items-center justify-between" style="margin-bottom:24px;">
      <h2 class="text-xl font-bold">⚙️ 项目设置</h2>
      <div class="flex gap-2 items-center">
        <span class="text-sm text-success" v-if="saved">✅ 已保存</span>
        <button class="btn btn-primary" @click="save">💾 保存设置</button>
      </div>
    </div>

    <div class="flex flex-col gap-6">
      <div class="card">
        <div class="card-header"><span class="font-semibold">基本信息</span></div>
        <div class="card-body">
          <div class="flex flex-col gap-4">
            <div>
              <label class="text-sm font-medium" style="display:block;margin-bottom:6px;">项目名称</label>
              <input class="input" v-model="form.title" placeholder="短剧名称" />
            </div>
            <div>
              <label class="text-sm font-medium" style="display:block;margin-bottom:6px;">项目描述</label>
              <textarea class="input" v-model="form.description" rows="3" placeholder="简要描述这个短剧项目..."></textarea>
            </div>
            <div class="flex gap-3">
              <div style="flex:1;">
                <label class="text-sm font-medium" style="display:block;margin-bottom:6px;">类型</label>
                <select class="input" v-model="form.genre">
                  <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>
              <div style="flex:1;">
                <label class="text-sm font-medium" style="display:block;margin-bottom:6px;">目标时长 (分钟)</label>
                <input class="input" type="number" v-model.number="form.targetDuration" min="1" max="300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="font-semibold">技术参数</span></div>
        <div class="card-body">
          <div class="flex flex-col gap-4">
            <div class="flex gap-3">
              <div style="flex:1;">
                <label class="text-sm font-medium" style="display:block;margin-bottom:6px;">画面比例</label>
                <select class="input" v-model="form.aspectRatio">
                  <option value="16:9">16:9 (横屏)</option>
                  <option value="9:16">9:16 (竖屏)</option>
                  <option value="1:1">1:1 (正方形)</option>
                  <option value="4:3">4:3 (传统)</option>
                </select>
              </div>
              <div style="flex:1;">
                <label class="text-sm font-medium" style="display:block;margin-bottom:6px;">分辨率</label>
                <select class="input" v-model="form.resolution">
                  <option value="1080p">1080p (Full HD)</option>
                  <option value="4K">4K (Ultra HD)</option>
                  <option value="720p">720p (HD)</option>
                </select>
              </div>
            </div>
            <div class="flex gap-3">
              <div style="flex:1;">
                <label class="text-sm font-medium" style="display:block;margin-bottom:6px;">帧率</label>
                <select class="input" v-model="form.frameRate">
                  <option :value="24">24 fps (电影感)</option>
                  <option :value="25">25 fps (PAL)</option>
                  <option :value="30">30 fps (标准)</option>
                  <option :value="60">60 fps (流畅)</option>
                </select>
              </div>
              <div style="flex:1;">
                <label class="text-sm font-medium" style="display:block;margin-bottom:6px;">语言</label>
                <select class="input" v-model="form.language">
                  <option value="zh-CN">中文(简体)</option>
                  <option value="zh-TW">中文(繁体)</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="font-semibold">项目信息</span></div>
        <div class="card-body">
          <div class="flex flex-col gap-2 text-sm">
            <div class="flex justify-between"><span class="text-tertiary">项目ID</span><span class="font-mono text-xs">{{ project.id }}</span></div>
            <div class="flex justify-between"><span class="text-tertiary">创建时间</span><span>{{ new Date(project.createdAt).toLocaleString('zh-CN') }}</span></div>
            <div class="flex justify-between"><span class="text-tertiary">最后修改</span><span>{{ new Date(project.updatedAt).toLocaleString('zh-CN') }}</span></div>
            <div class="flex justify-between"><span class="text-tertiary">当前状态</span><span>{{ project.status === 'draft' ? '草稿' : project.status === 'in-progress' ? '制作中' : project.status === 'completed' ? '已完成' : '已发布' }}</span></div>
          </div>
        </div>
      </div>

      <div class="card" style="border-color:var(--danger);">
        <div class="card-header" style="color:var(--danger);"><span class="font-semibold">⚠️ 危险操作</span></div>
        <div class="card-body">
          <p class="text-sm text-secondary" style="margin-bottom:12px;">删除项目将永久移除所有剧集、场景、角色和数据。此操作不可撤销。</p>
          <button class="btn btn-danger" @click="deleteCurrentProject">🗑️ 删除此项目</button>
        </div>
      </div>
    </div>
  </div>
</template>