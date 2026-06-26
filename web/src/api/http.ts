import axios from 'axios'

export const http = axios.create({
  baseURL: '',
  withCredentials: true, // 携带会话 cookie
})

// 401 → 标记未登录（路由守卫会跳登录页）
http.interceptors.response.use(
  res => res,
  (err) => {
    if (err.response?.status === 401) {
      // 触发登录态失效（避免循环 import，用事件简单处理）
      window.dispatchEvent(new CustomEvent('jie:unauthorized'))
    }
    return Promise.reject(err)
  },
)
