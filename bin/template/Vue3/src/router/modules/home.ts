export default [
  {
    path: '/home',
    component: () => import(`@/views/home/index.vue`),
    name: 'Dashboard',
    meta: {
      title: '首页',
    },
  }
]