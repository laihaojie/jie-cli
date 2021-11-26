import axios, { AxiosInstance, Method } from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import router from '@/router'
import config from "~/config"
import { localGet } from './index'


const service: AxiosInstance = axios.create({
  baseURL: config.baseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 拦截请求
service.interceptors.request.use(
  config => {
    config.headers["authorization"] = localGet("token") || ""
    return config
  },
  error => {
    // console.log(error);
    return Promise.reject(error)
  }
)

// 拦截响应
service.interceptors.response.use(res => {
  if (res.data.code == 1) return res.data.data
  if (res.data.code == 1000) return res.data
  if (!res.data.code) return res.data
  if (res.data.code == 401) {
    // 清除token
    store.dispatch('app/clearToken')
    router.push(`/login?url=${encodeURIComponent(window.location.href)}`)

    return new Promise(() => { })
  }
  return Promise.reject(res.data.message)
},
  async error => {
    ElMessage.error(error.message)
    return new Promise(() => { })
  }
)

async function request<T>(url: string, method: Method, data = {}): Promise<T> {
  return await service({ url, method, [method.toLocaleLowerCase() === 'get' ? 'params' : 'data']: data }).catch((error) => {
    console.log(error);
    ElMessage.error(error instanceof Error ? "服务器繁忙" : error)
    return new Promise(() => { })
  }) as T
}

export default service
export const Get = <T>(url: string, data?: Object | {}): Promise<T> => request<T>(url, "get", data)
export const Post = <T>(url: string, data?: Object | {}): Promise<T> => request<T>(url, "post", data)