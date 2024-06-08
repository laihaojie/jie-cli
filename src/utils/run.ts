import { execSync } from 'node:child_process'
import process from 'node:process'
import { Buffer } from 'node:buffer'
import chalk from 'chalk'
import iconv from 'iconv-lite'
import { getGitBashPath } from './terminal'

export function runCmd(cmd, shell?: string) {
  if (!cmd) {
    console.error(chalk.bold.red('缺少指令配置'))
    process.exit(1)
  }
  const isWin = process.platform === 'win32'

  try {
    if (isWin) {
      if (!globalThis.__GIT_BASH)
        globalThis.__GIT_BASH = getGitBashPath()

      if (globalThis.__GIT_BASH)
        execSync(cmd, { windowsHide: true, stdio: 'inherit', shell: shell || globalThis.__GIT_BASH })
      else
        execSync(cmd, { windowsHide: true, stdio: 'inherit' })
    }
    else { execSync(cmd, { windowsHide: true, stdio: 'inherit' }) }
  }
  catch (e: any) {
    console.error(chalk.bold.red('指令执行失败:'), e.message)
    process.exit(1)
  }
}

export function runCmdGetRes(cmd, shell?: string) {
  if (!cmd) {
    console.error(chalk.bold.red('缺少指令配置'))
    process.exit(1)
  }
  const isWin = process.platform === 'win32'
  let res

  try {
    if (isWin) {
      if (!globalThis.__GIT_BASH)
        globalThis.__GIT_BASH = getGitBashPath()

      if (globalThis.__GIT_BASH)
        res = execSync(cmd, { windowsHide: true, stdio: 'pipe', shell: shell || globalThis.__GIT_BASH })
      else
        res = execSync(cmd, { windowsHide: true, stdio: 'pipe' })
    }
    else { res = execSync(cmd, { windowsHide: true, stdio: 'pipe' }) }
  }
  catch (e: any) {
    console.error(chalk.bold.red('指令执行失败:'), e.message)
    process.exit(1)
  }

  return iconv.decode(Buffer.from(res), 'GBK').trim()
}
