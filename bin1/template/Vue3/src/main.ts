import { createApp } from 'vue'
import App from './App.vue'

// 引入路由
import router from './router'

// 引入store
import store from './store'

const app = createApp(App)

// 注册全局组件
// import * as Components from './components/global-components'
// Object.entries(Components).forEach(([key, component]) => {
//   app.component(key, component)
// })

app.use(store).use(router).mount('#app')
