<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDramaStore } from '../stores/drama'
import type { Character } from '../types'

const route = useRoute()
const store = useDramaStore()
const id = route.params.id as string

const project = computed(() => store.projects.find(p => p.id === id))
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingCharacter = ref<Character | null>(null)
const newChar = ref({
  name: '', role: 'supporting' as const, gender: 'other' as const,
  age: 25, description: '', avatar: '', traits: [] as string[]
})
const traitInput = ref('')

function addTrait() {
  if (traitInput.value.trim()) {
    newChar.value.traits.push(traitInput.value.trim())
    traitInput.value = ''
  }
}
function removeTrait(i: number) { newChar.value.traits.splice(i, 1) }

function addCharacter() {
  if (!newChar.value.name.trim()) return
  store.addCharacter(id, { ...newChar.value })
  newChar.value = { name: '', role: 'supporting', gender: 'other', age: 25, description: '', avatar: '', traits: [] }
  showAddModal.value = false
}

function editCharacter(char: Character) {
  editingCharacter.value = { ...char, traits: [...char.traits] }
  showEditModal.value = true
}

function saveCharacter() {
  if (!editingCharacter.value) return
  store.updateCharacter(id, editingCharacter.value.id, editingCharacter.value)
  showEditModal.value = false
  editingCharacter.value = null
}

function deleteCharacter(charId: string, name: string) {
  if (confirm(`确定删除角色"${name}"吗？`)) store.deleteCharacter(id, charId)
}

const roleLabels: Record<string, string> = {
  protagonist: '🌟 主角', antagonist: '😈 反派', supporting: '👤 配角', cameo: '👋 客串', extra: '👥 群众'
}
const roleColors: Record<string, string> = {
  protagonist: 'badge-primary', antagonist: 'badge-danger', supporting: 'badge-info', cameo: 'badge-warning', extra: 'badge-success'
}
</script>

<template>
  <div v-if="project">
    <div class="flex items-center justify-between" style="margin-bottom:20px;">
      <h2 class="text-xl font-bold">👥 角色管理 ({{ project.characters.length }})</h2>
      <button class="btn btn-primary" @click="showAddModal = true">+ 添加角色</button>
    </div>

    <div v-if="project.characters.length === 0" class="empty-state card" style="padding:60px;">
      <div class="empty-icon">👥</div>
      <div class="empty-title">还没有角色</div>
      <div class="empty-desc">创建角色来充实你的剧本</div>
    </div>

    <div class="character-grid">
      <div v-for="char in project.characters" :key="char.id" class="character-card card">
        <div class="character-card-body">
          <div class="flex items-center gap-4" style="margin-bottom:12px;">
            <div class="char-avatar">{{ char.avatar || char.name.charAt(0) }}</div>
            <div>
              <div class="font-semibold text-lg">{{ char.name }}</div>
              <span class="badge" :class="roleColors[char.role]">{{ roleLabels[char.role] }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3 text-sm text-tertiary" style="margin-bottom:8px;">
            <span>{{ char.gender === 'male' ? '♂ 男' : char.gender === 'female' ? '♀ 女' : '其他' }}</span>
            <span>·</span>
            <span>{{ char.age }}岁</span>
          </div>
          <p class="text-sm text-secondary" style="margin-bottom:8px;">{{ char.description || '暂无描述' }}</p>
          <div class="flex gap-1 flex-wrap" v-if="char.traits.length > 0">
            <span v-for="t in char.traits" :key="t" class="badge badge-info">{{ t }}</span>
          </div>
          <!-- Relations -->
          <div v-if="char.relations.length > 0" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-light);">
            <div class="text-xs text-tertiary font-medium" style="margin-bottom:4px;">关系网络</div>
            <div class="flex gap-2 flex-wrap">
              <span v-for="r in char.relations" :key="r.targetId" class="text-xs" style="padding:2px 8px;background:var(--bg-tertiary);border-radius:100px;">
                {{ r.targetName }} → {{ r.relation }}
              </span>
            </div>
          </div>
        </div>
        <div class="character-card-footer">
          <button class="btn btn-outline btn-sm" @click="editCharacter(char)">✏️ 编辑</button>
          <button class="btn btn-danger btn-sm" @click="deleteCharacter(char.id, char.name)">🗑️ 删除</button>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <div class="modal-overlay" v-if="showAddModal" @click.self="showAddModal = false">
      <div class="modal" style="max-width:500px;">
        <div class="modal-header"><h3>添加角色</h3><button class="btn btn-ghost btn-icon" @click="showAddModal = false">✕</button></div>
        <div class="modal-body">
          <div class="flex flex-col gap-3">
            <div class="flex gap-3">
              <div style="flex:1;"><label class="text-sm font-medium">角色名 *</label><input class="input" v-model="newChar.name" placeholder="角色姓名" autofocus /></div>
              <div style="flex:1;"><label class="text-sm font-medium">角色类型</label><select class="input" v-model="newChar.role"><option value="protagonist">主角</option><option value="antagonist">反派</option><option value="supporting">配角</option><option value="cameo">客串</option><option value="extra">群众</option></select></div>
            </div>
            <div class="flex gap-3">
              <div style="flex:1;"><label class="text-sm font-medium">性别</label><select class="input" v-model="newChar.gender"><option value="male">男</option><option value="female">女</option><option value="other">其他</option></select></div>
              <div style="width:100px;"><label class="text-sm font-medium">年龄</label><input class="input" type="number" v-model.number="newChar.age" min="1" max="150" /></div>
            </div>
            <div><label class="text-sm font-medium">头像/Emoji</label><input class="input" v-model="newChar.avatar" placeholder="可选，如 😊" /></div>
            <div><label class="text-sm font-medium">描述</label><textarea class="input" v-model="newChar.description" rows="2" placeholder="角色背景..."></textarea></div>
            <div>
              <label class="text-sm font-medium">性格特征</label>
              <div class="flex gap-2" style="margin-top:4px;">
                <input class="input" v-model="traitInput" placeholder="添加特征..." @keydown.enter="addTrait" style="flex:1;" />
                <button class="btn btn-outline btn-sm" @click="addTrait">添加</button>
              </div>
              <div class="flex gap-1 flex-wrap" style="margin-top:8px;" v-if="newChar.traits.length > 0">
                <span v-for="(t, i) in newChar.traits" :key="i" class="badge badge-info" style="cursor:pointer;" @click="removeTrait(i)">{{ t }} ✕</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary" @click="addCharacter" :disabled="!newChar.name.trim()">添加</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" v-if="showEditModal && editingCharacter" @click.self="showEditModal = false">
      <div class="modal" style="max-width:500px;">
        <div class="modal-header"><h3>编辑角色</h3><button class="btn btn-ghost btn-icon" @click="showEditModal = false">✕</button></div>
        <div class="modal-body">
          <div class="flex flex-col gap-3">
            <div class="flex gap-3">
              <div style="flex:1;"><label class="text-sm font-medium">角色名</label><input class="input" v-model="editingCharacter.name" /></div>
              <div style="flex:1;"><label class="text-sm font-medium">角色类型</label><select class="input" v-model="editingCharacter.role"><option value="protagonist">主角</option><option value="antagonist">反派</option><option value="supporting">配角</option><option value="cameo">客串</option><option value="extra">群众</option></select></div>
            </div>
            <div class="flex gap-3">
              <div style="flex:1;"><label class="text-sm font-medium">性别</label><select class="input" v-model="editingCharacter.gender"><option value="male">男</option><option value="female">女</option><option value="other">其他</option></select></div>
              <div style="width:100px;"><label class="text-sm font-medium">年龄</label><input class="input" type="number" v-model.number="editingCharacter.age" /></div>
            </div>
            <div><label class="text-sm font-medium">描述</label><textarea class="input" v-model="editingCharacter.description" rows="3"></textarea></div>
            <div><label class="text-sm font-medium">特征 (逗号分隔)</label>
              <input class="input" :value="editingCharacter.traits.join(', ')" @input="editingCharacter.traits = ($event.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(Boolean)" placeholder="勇敢, 聪明, 冲动" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditModal = false">取消</button>
          <button class="btn btn-primary" @click="saveCharacter">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.character-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.character-card-body {
  padding: 20px;
  flex: 1;
}
.character-card-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: 8px;
}
.char-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}
</style>