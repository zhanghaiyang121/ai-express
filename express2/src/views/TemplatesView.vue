<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDramaStore } from '../stores/drama'

const router = useRouter()
const store = useDramaStore()
const filterGenre = ref('all')

const templates = [
  { name: '总裁复仇', icon: '💼', genre: '都市', desc: '商业女强人被陷害后强势回归复仇的故事结构', scenes: '开场打击 → 低谷重生 → 擦肩而过 → 身份揭晓 → 甜蜜结局', episodes: 6 },
  { name: '穿越逆袭', icon: '⏳', genre: '穿越', desc: '现代人穿越到古代，利用现代知识逆袭人生的爽文结构', scenes: '意外穿越 → 适应环境 → 展露才华 → 危机降临 → 力挽狂澜', episodes: 8 },
  { name: '甜宠爱情', icon: '💕', genre: '爱情', desc: '霸道总裁与普通女孩的甜蜜爱情故事，先婚后爱经典结构', scenes: '命运相遇 → 契约关系 → 日常相处 → 心动时刻 → 告白结局', episodes: 5 },
  { name: '悬疑探案', icon: '🔍', genre: '悬疑', desc: '探案小队破解连环谜案的紧张悬疑故事', scenes: '案件发生 → 初步调查 → 线索断掉 → 突破发现 → 真相大白', episodes: 7 },
  { name: '校园青春', icon: '🏫', genre: '校园', desc: '校园里的青涩爱情与成长故事', scenes: '新学期开始 → 初次相遇 → 共同经历 → 误会产生 → 和解成长', episodes: 4 },
  { name: '古装宫斗', icon: '🏯', genre: '古装', desc: '后宫嫔妃之间的权力斗争与生存故事', scenes: '入宫选秀 → 初涉宫斗 → 晋级位分 → 生死危机 → 笑到最后', episodes: 10 },
  { name: '科幻冒险', icon: '🚀', genre: '科幻', desc: '未来世界的冒险故事，人类与AI的共生之旅', scenes: '发现秘密 → 组队出发 → 遭遇危机 → 揭示真相 → 拯救世界', episodes: 6 },
  { name: '喜剧家庭', icon: '😄', genre: '喜剧', desc: '温馨搞笑的中国式家庭生活故事', scenes: '家庭冲突 → 搞笑日常 → 误会升级 → 温暖和解 → 团圆结局', episodes: 4 },
  { name: '奇幻修仙', icon: '🧙', genre: '奇幻', desc: '凡人修仙路上的艰难险阻与成长突破', scenes: '废材开局 → 机缘巧合 → 修为突破 → 师门危机 → 飞升结局', episodes: 12 },
  { name: '都市奇幻', icon: '🌆', genre: '都市', desc: '都市生活中隐藏的超能力觉醒故事', scenes: '能力觉醒 → 适应力量 → 遭遇对手 → 最终对决 → 生活回归', episodes: 5 },
]

const genres = ['all', '都市', '穿越', '爱情', '悬疑', '校园', '古装', '科幻', '喜剧', '奇幻']

const filteredTemplates = computed(() => {
  if (filterGenre.value === 'all') return templates
  return templates.filter(t => t.genre === filterGenre.value)
})

function useTemplate(t: typeof templates[0]) {
  const project = store.createProject({
    title: t.name + ' - 短剧项目',
    genre: t.genre,
    description: t.desc,
    targetDuration: t.episodes * 2
  })
  // Add template episodes and scenes
  const sceneTitles = t.scenes.split(' → ')
  for (let i = 0; i < t.episodes; i++) {
    const ep = store.addEpisode(project.id, {
      episodeNumber: i + 1,
      title: `第 ${i + 1} 集 - ${sceneTitles[i] || '新剧集'}`,
      status: 'planning'
    })
    // Add one scene per episode initially
    store.addScene(project.id, ep.id, {
      sceneNumber: 1,
      title: sceneTitles[i] || '新场景',
      description: t.desc,
      status: 'todo',
      duration: 120
    })
  }
  router.push(`/project/${project.id}`)
}
</script>

<template>
  <div class="templates-page" style="max-width:1200px;margin:0 auto;">
    <div class="flex items-center justify-between" style="margin-bottom:24px;">
      <div>
        <h1 class="text-2xl font-bold" style="margin-bottom:4px;">📋 模板库</h1>
        <p class="text-sm text-secondary">选择一个模板快速开始您的短剧创作</p>
      </div>
      <router-link to="/projects" class="btn btn-outline">← 返回项目</router-link>
    </div>

    <!-- Genre Filter -->
    <div class="flex gap-2 flex-wrap" style="margin-bottom:24px;">
      <button
        v-for="g in genres"
        :key="g"
        class="btn"
        :class="filterGenre === g ? 'btn-primary' : 'btn-outline'"
        @click="filterGenre = g"
      >
        {{ g === 'all' ? '全部' : g }}
      </button>
    </div>

    <!-- Template Grid -->
    <div class="template-grid">
      <div v-for="t in filteredTemplates" :key="t.name" class="template-card card">
        <div class="template-card-header" :style="{ background: `linear-gradient(135deg, hsl(${t.name.charCodeAt(0) * 5 % 360}, 50%, 50%), hsl(${t.name.charCodeAt(1) * 4 % 360}, 45%, 40%))` }">
          <span class="template-icon">{{ t.icon }}</span>
          <span class="badge" style="background:rgba(255,255,255,0.2);color:white;">{{ t.genre }}</span>
        </div>
        <div class="template-card-body">
          <h3 class="font-semibold text-lg" style="margin-bottom:4px;">{{ t.name }}</h3>
          <p class="text-sm text-secondary" style="margin-bottom:12px;">{{ t.desc }}</p>
          <div class="text-xs text-tertiary" style="margin-bottom:6px;">
            <strong>剧情结构:</strong> {{ t.scenes }}
          </div>
          <div class="flex items-center gap-2 text-xs text-tertiary">
            <span>📺 {{ t.episodes }} 集</span>
          </div>
        </div>
        <div class="template-card-footer">
          <button class="btn btn-primary w-full" @click="useTemplate(t)">🚀 使用此模板</button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.template-card { overflow: hidden; }
.template-card-header {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.template-card-header .badge {
  position: absolute;
  top: 10px;
  right: 10px;
}
.template-icon {
  font-size: 48px;
  opacity: 0.9;
}
.template-card-body { padding: 16px 20px; }
.template-card-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-light);
}
.w-full { width: 100%; }
</style>