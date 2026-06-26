import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('@/layouts/MainLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('@/views/Home.vue') },
        { path: 'terminal', name: 'terminal', component: () => import('@/views/Terminal.vue') },
      ],
    },
    { path: '/login', name: 'login', component: () => import('@/views/Login.vue') },
  ],
})

// 路由守卫：需要鉴权且未登录 → 跳登录页
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  // 首次进入先确认登录态
  if (!auth.initialized)
    await auth.fetchSession()

  if (to.name !== 'login' && auth.authRequired && !auth.loggedIn)
    return { name: 'login' }
})
