import process from 'node:process'
import path from 'node:path'
import { spawn } from 'node:child_process'
import chalk from 'chalk'
import { version } from '../../package.json'
import { getVersion } from './store'

export function checkVersion() {
  if (process.argv[2] === 'update')
    return

  const latest_version = getVersion()
  if (latest_version !== version)
    console.log(`有新版本更新啦! 输入: ${chalk.yellow('jie update')} 更新到最新版`)

  const checkFilePath = path.resolve(__dirname, 'check.cjs')
  const server = spawn(process.argv[0], [checkFilePath], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  server.unref()
}
