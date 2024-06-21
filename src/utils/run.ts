import type { ExecSyncOptions } from 'node:child_process'
import { execSync } from 'node:child_process'
import process from 'node:process'
import { Buffer } from 'node:buffer'
import chalk from 'chalk'
import iconv from 'iconv-lite'
import { getGitBashPath } from './terminal'

export function runCmd(cmd, options = {} as ExecSyncOptions) {
  if (!cmd) {
    console.error(chalk.bold.red('缺少指令配置'))
    return
  }
  const isWin = process.platform === 'win32'

  try {
    if (isWin) {
      if (!globalThis.__GIT_BASH)
        globalThis.__GIT_BASH = getGitBashPath()

      if (globalThis.__GIT_BASH)
        execSync(cmd, { windowsHide: true, stdio: 'inherit', ...options, shell: options.shell || globalThis.__GIT_BASH })
      else
        execSync(cmd, { windowsHide: true, stdio: 'inherit', ...options })
    }
    else { execSync(cmd, { windowsHide: true, stdio: 'inherit', ...options }) }
  }
  catch (e: any) {
    console.error(chalk.bold.red('指令执行失败:'), e.message)
  }
}

export function runCmdGetRes(cmd, options = {} as ExecSyncOptions) {
  if (!cmd) {
    console.error(chalk.bold.red('缺少指令配置'))
    return ''
  }
  const isWin = process.platform === 'win32'
  let res

  try {
    if (isWin) {
      if (!globalThis.__GIT_BASH)
        globalThis.__GIT_BASH = getGitBashPath()

      if (globalThis.__GIT_BASH)
        res = execSync(cmd, { windowsHide: true, stdio: 'pipe', ...options, shell: options.shell || globalThis.__GIT_BASH })
      else
        res = execSync(cmd, { windowsHide: true, stdio: 'pipe', ...options })
    }
    else { res = execSync(cmd, { windowsHide: true, stdio: 'pipe', ...options }) }
  }
  catch (e: any) {
    console.error(chalk.bold.red('指令执行失败:'), iconv.decode(Buffer.from(e.message), 'utf8').trim())
    return iconv.decode(Buffer.from(e.message), 'utf8').trim()
  }

  return iconv.decode(Buffer.from(res), 'utf8').trim()
}
