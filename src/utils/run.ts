import type { ExecSyncOptions, SpawnOptions } from 'node:child_process'
import { Buffer } from 'node:buffer'
import { execSync, spawn } from 'node:child_process'
import process from 'node:process'
import chalk from 'chalk'
import iconv from 'iconv-lite'
import { getGitBashPath } from './terminal'

export function runCmdSync(cmd, options = {} as ExecSyncOptions) {
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

export function runCmd(cmd: string, options: SpawnOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!cmd) {
      console.error(chalk.bold.red('缺少指令配置'))
      return reject(new Error('缺少指令配置'))
    }
    const isWin = process.platform === 'win32'
    if (isWin) {
      if (!globalThis.__GIT_BASH) {
        globalThis.__GIT_BASH = getGitBashPath()
      }
      if (globalThis.__GIT_BASH) {
        options.shell = options.shell || globalThis.__GIT_BASH
      }
    }

    options.windowsHide = true

    const child = spawn(cmd, { stdio: 'pipe', ...options })

    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`指令执行失败，退出码: ${code}`))
    })

    child.stdout.on('data', (data) => {
      console.log(iconv.decode(Buffer.from(data), 'utf8').trim())
    })

    child.on('error', (err) => {
      console.error(chalk.bold.red('指令执行失败:'), err.message)
      reject(err)
    })
  })
}
