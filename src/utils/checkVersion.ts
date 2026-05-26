import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { version } from '../../package.json'
import { getVersion, rootDir } from './store'

const CHECK_INTERVAL = 60 * 60 * 1000 // 1小时
const checkLockFile = path.join(rootDir, 'check.lock')

export function checkVersion() {
  if (process.argv[2] === 'update')
    return

  const latest_version = getVersion()
  if (latest_version !== version)
    console.log(`有新版本更新啦! 输入: ${chalk.yellow('jie update')} 更新到最新版`)

  // 避免频繁 spawn 检查进程
  try {
    if (fs.existsSync(checkLockFile)) {
      const lastCheck = Number(fs.readFileSync(checkLockFile, 'utf-8'))
      if (Date.now() - lastCheck < CHECK_INTERVAL)
        return
    }
    fs.writeFileSync(checkLockFile, String(Date.now()))
  }
  catch {
    // 忽略锁文件读写错误
  }

  const checkFilePath = path.resolve(__dirname, 'check.cjs')
  const server = spawn(process.argv[0], [checkFilePath], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  server.unref()
}
