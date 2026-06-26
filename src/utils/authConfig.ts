import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// ~/.jie/config.json —— 存放 bridge 鉴权密码等用户配置
export const authConfigPath = path.resolve(os.homedir(), './.jie/config.json')

export interface AuthConfig {
  authPassword?: string
  [key: string]: unknown
}

function readConfig(): AuthConfig {
  try {
    if (fs.existsSync(authConfigPath)) {
      const raw = fs.readFileSync(authConfigPath, 'utf-8').trim()
      if (!raw)
        return {}
      return JSON.parse(raw) as AuthConfig
    }
  }
  catch {
    // 损坏的配置文件忽略
  }
  return {}
}

function writeConfig(config: AuthConfig): void {
  const dir = path.dirname(authConfigPath)
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(authConfigPath, JSON.stringify(config, null, 2))
}

// 读取已配置的鉴权密码（空字符串 = 未配置 = 不鉴权）
export function getAuthPassword(): string {
  return readConfig().authPassword ?? ''
}

// 设置鉴权密码（合并写入，保留其他键）
export function setAuthPassword(password: string): void {
  const config = readConfig()
  config.authPassword = password
  writeConfig(config)
}

// 清除鉴权密码
export function clearAuthPassword(): void {
  const config = readConfig()
  delete config.authPassword
  writeConfig(config)
}
