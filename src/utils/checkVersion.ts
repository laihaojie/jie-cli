import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { version } from '../../package.json'
import { getVersionCache } from './store'

const CHECK_INTERVAL = 60 * 60 * 1000 // 1小时

function semverGt(a: string, b: string): boolean {
  const pa = a.replace(/^v/, '').split('.').map(Number)
  const pb = b.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na > nb) return true
    if (na < nb) return false
  }
  return false
}

export function checkVersion() {
  const cmd = process.argv[2]
  if (cmd === 'update')
    return

  const cache = getVersionCache()

  // 仅当缓存中有合法版本且确实比当前新时才提示
  if (cache?.latestVersion && semverGt(cache.latestVersion, version)) {
    console.log(`有新版本更新啦! 输入: ${chalk.yellow('jie update')} 更新到最新版 (${version} → ${cache.latestVersion})`)
  }

  // 缓存过期时后台刷新
  const lastAttempt = cache?.lastAttemptAt || 0
  if (Date.now() - lastAttempt < CHECK_INTERVAL)
    return

  const checkFilePath = path.resolve(__dirname, 'check.cjs')
  const child = spawn(process.argv[0], [checkFilePath], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  child.unref()
}
