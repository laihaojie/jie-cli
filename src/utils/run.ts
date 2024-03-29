import { execSync } from 'node:child_process'
import process from 'node:process'
import chalk from 'chalk'

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
