import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DramaProject, Episode, Scene, Character, Asset, Note, DialogueLine, Shot } from '../types'

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9)

const getDefaultSettings = () => ({
  aspectRatio: '16:9' as const,
  resolution: '1080p' as const,
  frameRate: 24 as const,
  language: 'zh-CN'
})

export const useDramaStore = defineStore('drama', () => {
  const projects = ref<DramaProject[]>([])
  const currentProjectId = ref<string | null>(null)
  const notes = ref<Note[]>([])

  const currentProject = computed(() =>
    projects.value.find(p => p.id === currentProjectId.value) || null
  )

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem('drama_studio_projects')
      if (saved) projects.value = JSON.parse(saved)
      const savedNotes = localStorage.getItem('drama_studio_notes')
      if (savedNotes) notes.value = JSON.parse(savedNotes)
      const pid = localStorage.getItem('drama_studio_current')
      if (pid) currentProjectId.value = pid
    } catch (e) {
      console.error('Failed to load data:', e)
    }
  }

  function saveToStorage() {
    localStorage.setItem('drama_studio_projects', JSON.stringify(projects.value))
    localStorage.setItem('drama_studio_notes', JSON.stringify(notes.value))
    if (currentProjectId.value) {
      localStorage.setItem('drama_studio_current', currentProjectId.value)
    }
  }

  function createProject(data: Partial<DramaProject>): DramaProject {
    const project: DramaProject = {
      id: generateId(),
      title: data.title || '未命名项目',
      description: data.description || '',
      cover: data.cover || '',
      genre: data.genre || '现代',
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      targetDuration: data.targetDuration || 10,
      episodes: [],
      characters: [],
      assets: [],
      settings: data.settings || getDefaultSettings()
    }
    projects.value.unshift(project)
    saveToStorage()
    return project
  }

  function updateProject(id: string, data: Partial<DramaProject>) {
    const idx = projects.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      projects.value[idx] = { ...projects.value[idx], ...data, updatedAt: Date.now() }
      saveToStorage()
    }
  }

  function deleteProject(id: string) {
    projects.value = projects.value.filter(p => p.id !== id)
    if (currentProjectId.value === id) currentProjectId.value = null
    notes.value = notes.value.filter(n => n.targetId !== id)
    saveToStorage()
  }

  function duplicateProject(id: string): DramaProject | null {
    const source = projects.value.find(p => p.id === id)
    if (!source) return null
    const newProject: DramaProject = {
      ...JSON.parse(JSON.stringify(source)),
      id: generateId(),
      title: source.title + ' (副本)',
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      episodes: source.episodes.map(ep => ({ ...ep, id: generateId() })),
      characters: source.characters.map(ch => ({ ...ch, id: generateId() })),
      assets: [...source.assets]
    }
    projects.value.unshift(newProject)
    saveToStorage()
    return newProject
  }

  // Episode management
  function addEpisode(projectId: string, data?: Partial<Episode>): Episode {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) throw new Error('Project not found')
    const epNum = project.episodes.length + 1
    const episode: Episode = {
      id: generateId(),
      episodeNumber: data?.episodeNumber || epNum,
      title: data?.title || `第 ${epNum} 集`,
      status: 'planning',
      duration: data?.duration || 0,
      scenes: [],
      notes: data?.notes || ''
    }
    project.episodes.push(episode)
    project.updatedAt = Date.now()
    saveToStorage()
    return episode
  }

  function updateEpisode(projectId: string, episodeId: string, data: Partial<Episode>) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    const ep = project.episodes.find(e => e.id === episodeId)
    if (ep) {
      Object.assign(ep, data)
      project.updatedAt = Date.now()
      saveToStorage()
    }
  }

  function deleteEpisode(projectId: string, episodeId: string) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    project.episodes = project.episodes.filter(e => e.id !== episodeId)
    project.updatedAt = Date.now()
    saveToStorage()
  }

  // Scene management
  function addScene(projectId: string, episodeId: string, data?: Partial<Scene>): Scene | null {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return null
    const episode = project.episodes.find(e => e.id === episodeId)
    if (!episode) return null
    const scNum = episode.scenes.length + 1
    const scene: Scene = {
      id: generateId(),
      sceneNumber: data?.sceneNumber || scNum,
      title: data?.title || `场景 ${scNum}`,
      location: data?.location || '',
      timeOfDay: data?.timeOfDay || 'afternoon',
      interior: data?.interior ?? true,
      description: data?.description || '',
      dialogue: data?.dialogue || [],
      shots: data?.shots || [],
      status: 'todo',
      duration: data?.duration || 60
    }
    episode.scenes.push(scene)
    project.updatedAt = Date.now()
    saveToStorage()
    return scene
  }

  function updateScene(projectId: string, episodeId: string, sceneId: string, data: Partial<Scene>) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    const episode = project.episodes.find(e => e.id === episodeId)
    if (!episode) return
    const scene = episode.scenes.find(s => s.id === sceneId)
    if (scene) {
      Object.assign(scene, data)
      project.updatedAt = Date.now()
      saveToStorage()
    }
  }

  function deleteScene(projectId: string, episodeId: string, sceneId: string) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    const episode = project.episodes.find(e => e.id === episodeId)
    if (!episode) return
    episode.scenes = episode.scenes.filter(s => s.id !== sceneId)
    project.updatedAt = Date.now()
    saveToStorage()
  }

  // Dialogue management
  function addDialogue(projectId: string, episodeId: string, sceneId: string, data: Partial<DialogueLine>): DialogueLine | null {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return null
    const episode = project.episodes.find(e => e.id === episodeId)
    if (!episode) return null
    const scene = episode.scenes.find(s => s.id === sceneId)
    if (!scene) return null
    const line: DialogueLine = {
      id: generateId(),
      characterId: data?.characterId || '',
      characterName: data?.characterName || '角色',
      text: data?.text || '',
      emotion: data?.emotion || '',
      notes: data?.notes || ''
    }
    scene.dialogue.push(line)
    project.updatedAt = Date.now()
    saveToStorage()
    return line
  }

  function updateDialogue(projectId: string, episodeId: string, sceneId: string, dialogueId: string, data: Partial<DialogueLine>) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    const episode = project.episodes.find(e => e.id === episodeId)
    if (!episode) return
    const scene = episode.scenes.find(s => s.id === sceneId)
    if (!scene) return
    const line = scene.dialogue.find(d => d.id === dialogueId)
    if (line) {
      Object.assign(line, data)
      project.updatedAt = Date.now()
      saveToStorage()
    }
  }

  function deleteDialogue(projectId: string, episodeId: string, sceneId: string, dialogueId: string) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    const episode = project.episodes.find(e => e.id === episodeId)
    if (!episode) return
    const scene = episode.scenes.find(s => s.id === sceneId)
    if (!scene) return
    scene.dialogue = scene.dialogue.filter(d => d.id !== dialogueId)
    project.updatedAt = Date.now()
    saveToStorage()
  }

  // Shot management
  function addShot(projectId: string, episodeId: string, sceneId: string, data?: Partial<Shot>): Shot | null {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return null
    const episode = project.episodes.find(e => e.id === episodeId)
    if (!episode) return null
    const scene = episode.scenes.find(s => s.id === sceneId)
    if (!scene) return null
    const shot: Shot = {
      id: generateId(),
      shotNumber: data?.shotNumber || (scene.shots.length + 1),
      type: data?.type || 'medium',
      angle: data?.angle || 'eye-level',
      description: data?.description || '',
      duration: data?.duration || 5
    }
    scene.shots.push(shot)
    project.updatedAt = Date.now()
    saveToStorage()
    return shot
  }

  function updateShot(projectId: string, episodeId: string, sceneId: string, shotId: string, data: Partial<Shot>) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    const episode = project.episodes.find(e => e.id === episodeId)
    if (!episode) return
    const scene = episode.scenes.find(s => s.id === sceneId)
    if (!scene) return
    const shot = scene.shots.find(s => s.id === shotId)
    if (shot) {
      Object.assign(shot, data)
      project.updatedAt = Date.now()
      saveToStorage()
    }
  }

  function deleteShot(projectId: string, episodeId: string, sceneId: string, shotId: string) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    const episode = project.episodes.find(e => e.id === episodeId)
    if (!episode) return
    const scene = episode.scenes.find(s => s.id === sceneId)
    if (!scene) return
    scene.shots = scene.shots.filter(s => s.id !== shotId)
    project.updatedAt = Date.now()
    saveToStorage()
  }

  // Character management
  function addCharacter(projectId: string, data?: Partial<Character>): Character {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) throw new Error('Project not found')
    const character: Character = {
      id: generateId(),
      name: data?.name || '新角色',
      role: data?.role || 'supporting',
      avatar: data?.avatar || '',
      gender: data?.gender || 'other',
      age: data?.age || 25,
      description: data?.description || '',
      traits: data?.traits || [],
      relations: data?.relations || []
    }
    project.characters.push(character)
    project.updatedAt = Date.now()
    saveToStorage()
    return character
  }

  function updateCharacter(projectId: string, characterId: string, data: Partial<Character>) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    const char = project.characters.find(c => c.id === characterId)
    if (char) {
      Object.assign(char, data)
      // Update dialogue references
      project.episodes.forEach(ep =>
        ep.scenes.forEach(sc =>
          sc.dialogue.forEach(d => {
            if (d.characterId === characterId) {
              d.characterName = char.name
            }
          })
        )
      )
      project.updatedAt = Date.now()
      saveToStorage()
    }
  }

  function deleteCharacter(projectId: string, characterId: string) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    project.characters = project.characters.filter(c => c.id !== characterId)
    // Remove relations
    project.characters.forEach(c => {
      c.relations = c.relations.filter(r => r.targetId !== characterId)
    })
    project.updatedAt = Date.now()
    saveToStorage()
  }

  // Asset management
  function addAsset(projectId: string, data: Partial<Asset>): Asset {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) throw new Error('Project not found')
    const asset: Asset = {
      id: generateId(),
      name: data?.name || '未命名素材',
      type: data?.type || 'other',
      url: data?.url || '',
      thumbnail: data?.thumbnail || '',
      size: data?.size || 0,
      duration: data?.duration,
      tags: data?.tags || [],
      createdAt: Date.now()
    }
    project.assets.push(asset)
    project.updatedAt = Date.now()
    saveToStorage()
    return asset
  }

  function deleteAsset(projectId: string, assetId: string) {
    const project = projects.value.find(p => p.id === projectId)
    if (!project) return
    project.assets = project.assets.filter(a => a.id !== assetId)
    project.updatedAt = Date.now()
    saveToStorage()
  }

  // Notes management
  function addNote(data: Partial<Note>): Note {
    const note: Note = {
      id: generateId(),
      type: data?.type || 'general',
      targetId: data?.targetId || '',
      content: data?.content || '',
      color: data?.color || '#fbbf24',
      createdAt: Date.now(),
      pinned: data?.pinned || false
    }
    notes.value.unshift(note)
    saveToStorage()
    return note
  }

  function updateNote(id: string, data: Partial<Note>) {
    const idx = notes.value.findIndex(n => n.id === id)
    if (idx !== -1) {
      notes.value[idx] = { ...notes.value[idx], ...data }
      saveToStorage()
    }
  }

  function deleteNote(id: string) {
    notes.value = notes.value.filter(n => n.id !== id)
    saveToStorage()
  }

  function toggleNotePin(id: string) {
    const note = notes.value.find(n => n.id === id)
    if (note) {
      note.pinned = !note.pinned
      saveToStorage()
    }
  }

  // Project stats
  const projectStats = computed(() => {
    if (!currentProject.value) return null
    const p = currentProject.value
    const totalScenes = p.episodes.reduce((sum, ep) => sum + ep.scenes.length, 0)
    const totalDuration = p.episodes.reduce((sum, ep) =>
      sum + ep.scenes.reduce((s, sc) => s + sc.duration, 0), 0)
    const doneScenes = p.episodes.reduce((sum, ep) =>
      sum + ep.scenes.filter(sc => sc.status === 'done').length, 0)
    const progress = totalScenes > 0 ? Math.round((doneScenes / totalScenes) * 100) : 0
    return { totalEpisodes: p.episodes.length, totalScenes, totalDuration, doneScenes, progress }
  })

  function exportProject(id: string): string {
    const project = projects.value.find(p => p.id === id)
    if (!project) return ''
    return JSON.stringify(project, null, 2)
  }

  function importProject(json: string): DramaProject | null {
    try {
      const data = JSON.parse(json)
      if (!data.id || !data.title) return null
      const existing = projects.value.findIndex(p => p.id === data.id)
      if (existing !== -1) {
        projects.value[existing] = data
      } else {
        projects.value.unshift(data)
      }
      saveToStorage()
      return data
    } catch {
      return null
    }
  }

  // Initialize
  loadFromStorage()

  return {
    projects,
    currentProjectId,
    currentProject,
    notes,
    projectStats,
    // Project
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    // Episodes
    addEpisode,
    updateEpisode,
    deleteEpisode,
    // Scenes
    addScene,
    updateScene,
    deleteScene,
    // Dialogue
    addDialogue,
    updateDialogue,
    deleteDialogue,
    // Shots
    addShot,
    updateShot,
    deleteShot,
    // Characters
    addCharacter,
    updateCharacter,
    deleteCharacter,
    // Assets
    addAsset,
    deleteAsset,
    // Notes
    addNote,
    updateNote,
    deleteNote,
    toggleNotePin,
    // Utils
    exportProject,
    importProject,
    saveToStorage
  }
})