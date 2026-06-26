import { defineStore } from 'pinia'
import { http } from '@/api/http'

interface SessionResp {
  authRequired: boolean
  loggedIn: boolean
  hostSuffix?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    initialized: false,
    authRequired: false,
    loggedIn: false,
    hostSuffix: '',
  }),
  actions: {
    async fetchSession() {
      try {
        const { data } = await http.get<SessionResp>('/api/session')
        this.authRequired = data.authRequired
        this.loggedIn = data.loggedIn
        this.hostSuffix = data.hostSuffix ?? ''
      }
      catch {
        this.authRequired = false
        this.loggedIn = false
      }
      this.initialized = true
    },
    async login(password: string): Promise<boolean> {
      try {
        await http.post('/api/login', { password })
        this.loggedIn = true
        return true
      }
      catch {
        return false
      }
    },
    async logout() {
      try { await http.post('/api/logout') }
      catch {}
      this.loggedIn = false
    },
  },
})
