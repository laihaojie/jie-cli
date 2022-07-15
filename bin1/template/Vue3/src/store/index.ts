import { createStore } from 'vuex'
import type { AppStore } from '../typings/store'

const modulesFiles = import.meta.globEager('./modules/*.ts')

const modules = Object.entries(modulesFiles).reduce((modules, [path, mod]) => {
  const moduleName = path.replace(/^\.\/modules\/(.*)\.\w+$/, '$1')
  modules[moduleName] = mod.default
  return modules
}, {})

export default createStore<AppStore>({
  modules,
})
