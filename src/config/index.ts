export const localServer = 'http://127.0.0.1:32677'

// bridge 后台服务配置（localServer 用 127.0.0.1 做活性检测；bridge 实际监听 0.0.0.0）
export const bridgeHost = '0.0.0.0'
export const bridgePort = 32677
export const bridgeAuthToken = '' // 空 = 不鉴权（默认信任内网；设为非空则 WS 连接需带 ?token=）

export enum RbActionMeta {
  run = 'run',
  get = 'get',
  set = 'set',
  log = 'log',
}
