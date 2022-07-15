import type { UserInfo } from './api'
export interface AppStore {
  account: {
    userinfo: UserInfo | null
  }
}
