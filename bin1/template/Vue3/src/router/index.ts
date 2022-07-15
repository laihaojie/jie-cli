import { createRouter, createWebHashHistory } from 'vue-router'
import home from './modules/home'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{
    path: '/',
    redirect: '/home',
  },
  ...home,
  ],
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export default router
