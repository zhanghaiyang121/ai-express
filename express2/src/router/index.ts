import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/projects'
    },
    {
      path: '/projects',
      name: 'Projects',
      component: () => import('../views/ProjectsView.vue')
    },
    {
      path: '/project/:id',
      name: 'ProjectHome',
      component: () => import('../views/ProjectHomeView.vue'),
      props: true
    },
    {
      path: '/project/:id/script',
      name: 'ScriptEditor',
      component: () => import('../views/ScriptEditorView.vue'),
      props: true
    },
    {
      path: '/project/:id/episodes',
      name: 'EpisodeManager',
      component: () => import('../views/EpisodeManagerView.vue'),
      props: true
    },
    {
      path: '/project/:id/characters',
      name: 'CharacterManager',
      component: () => import('../views/CharacterManagerView.vue'),
      props: true
    },
    {
      path: '/project/:id/storyboard',
      name: 'Storyboard',
      component: () => import('../views/StoryboardView.vue'),
      props: true
    },
    {
      path: '/project/:id/assets',
      name: 'AssetManager',
      component: () => import('../views/AssetManagerView.vue'),
      props: true
    },
    {
      path: '/project/:id/settings',
      name: 'ProjectSettings',
      component: () => import('../views/ProjectSettingsView.vue'),
      props: true
    },
    {
      path: '/templates',
      name: 'Templates',
      component: () => import('../views/TemplatesView.vue')
    }
  ]
})

export default router