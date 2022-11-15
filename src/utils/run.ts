import { execSync } from 'child_process'
import chalk from 'chalk'

export async function runCmd(cmd, win = 'powershell') {
  if (!cmd) return console.log(chalk.bold.red('缺少指令配置'))
  const isWin = process.platform === 'win32'

  if (isWin) {
    if (win === 'powershell')
      execSync(cmd, { stdio: 'inherit', shell: 'powershell.exe' })
    else
      execSync(cmd, { stdio: 'inherit', shell: 'cmd.exe' })
  }
  else { execSync(cmd, { stdio: 'inherit' }) }
}
