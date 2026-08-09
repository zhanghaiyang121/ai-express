export interface DramaProject {
  id: string
  title: string
  description: string
  cover: string
  genre: string
  status: 'draft' | 'in-progress' | 'completed' | 'published'
  createdAt: number
  updatedAt: number
  targetDuration: number // minutes
  episodes: Episode[]
  characters: Character[]
  assets: Asset[]
  settings: ProjectSettings
}

export interface ProjectSettings {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3'
  resolution: '1080p' | '4K' | '720p'
  frameRate: 24 | 25 | 30 | 60
  language: string
}

export interface Episode {
  id: string
  episodeNumber: number
  title: string
  status: 'planning' | 'script' | 'shooting' | 'editing' | 'done'
  duration: number // seconds
  scenes: Scene[]
  notes: string
}

export interface Scene {
  id: string
  sceneNumber: number
  title: string
  location: string
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night'
  interior: boolean
  description: string
  dialogue: DialogueLine[]
  shots: Shot[]
  status: 'todo' | 'in-progress' | 'done'
  duration: number // seconds
}

export interface DialogueLine {
  id: string
  characterId: string
  characterName: string
  text: string
  emotion: string
  notes: string
}

export interface Shot {
  id: string
  shotNumber: number
  type: 'wide' | 'medium' | 'close-up' | 'extreme-close-up' | 'aerial' | 'pan' | 'tilt' | 'tracking' | 'pov'
  angle: 'eye-level' | 'low' | 'high' | 'dutch' | 'overhead'
  description: string
  duration: number
}

export interface Character {
  id: string
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting' | 'cameo' | 'extra'
  avatar: string
  gender: 'male' | 'female' | 'other'
  age: number
  description: string
  traits: string[]
  relations: CharacterRelation[]
}

export interface CharacterRelation {
  targetId: string
  targetName: string
  relation: string
}

export interface Asset {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'script' | 'other'
  url: string
  thumbnail: string
  size: number
  duration?: number
  tags: string[]
  createdAt: number
}

export interface Storyboard {
  id: string
  sceneId: string
  frames: StoryboardFrame[]
}

export interface StoryboardFrame {
  id: string
  image: string
  description: string
  shotType: string
  duration: number
  notes: string
  order: number
}

export interface Template {
  id: string
  name: string
  description: string
  genre: string
  structure: TemplateScene[]
}

export interface TemplateScene {
  sceneNumber: number
  title: string
  template: string
}

export interface Note {
  id: string
  type: 'general' | 'character' | 'scene' | 'plot'
  targetId: string
  content: string
  color: string
  createdAt: number
  pinned: boolean
}