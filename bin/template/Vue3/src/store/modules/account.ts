import { AppStore } from '~/src/typings/store'


export default {
  namespaced: true,
  state: <AppStore['account']>{
    userinfo: null,
  },
  mutations: {
    // 保存用户信息
    setUserinfo(state, data) {
      state.userinfo = data
    },
    // 清除用户信息
    clearUserinfo(state) {
      state.userinfo = null
    },

  },
  actions: {
    // 获取用户信息
    async getUserinfo({ commit }) {
      const userinfo = {} // 用户信息数据
      commit('setUserinfo', userinfo)
      return Promise.resolve(userinfo)
    },

  },
}