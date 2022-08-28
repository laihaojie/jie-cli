import { execSync } from 'child_process'
import chalk from 'chalk'
import { version } from '../../package.json'

export function checkVersion() {
  const latest_version = execSync('npm view @djie/cli version', { stdio: 'pipe' }).toString().trim()
  if (latest_version !== version)
    console.log(`有新版本更新啦! 输入: ${chalk.yellow('npm i -g @djie/cli')} 更新到最新版`)
}
