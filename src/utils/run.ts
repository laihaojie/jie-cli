import { execSync } from 'node:child_process'
import process from 'node:process'
import { Buffer } from 'node:buffer'
import chalk from 'chalk'
import iconv from 'iconv-lite'

export async function runCmd(cmd, win = 'powershell') {
  if (!cmd) {
    console.error(chalk.bold.red('缺少指令配置'))
    process.exit(1)
  }
  const isWin = process.platform === 'win32'

  if (isWin) {
    if (win === 'powershell')
      execSync(cmd, { stdio: 'inherit', shell: 'powershell.exe' })
    else
      execSync(cmd, { stdio: 'inherit', shell: 'cmd.exe' })
  }
  else { execSync(cmd, { stdio: 'inherit' }) }
}

export function runCmdGetRes(cmd, win = 'powershell') {
  if (!cmd) {
    console.error(chalk.bold.red('缺少指令配置'))
    process.exit(1)
  }
  const isWin = process.platform === 'win32'
  let res

  if (isWin) {
    if (win === 'powershell')
      res = execSync(cmd, { stdio: 'pipe', shell: 'powershell.exe' })
    else
      res = execSync(cmd, { stdio: 'pipe', shell: 'cmd.exe' })
  }
  else { res = execSync(cmd, { stdio: 'pipe' }) }

  return iconv.decode(Buffer.from(res), 'GBK').trim()
}
