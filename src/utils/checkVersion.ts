import { execSync } from 'child_process'
import chalk from 'chalk'
import { version } from '../../package.json'

export function checkVersion() {
  if (process.argv[2] === 'update') return

  const latest_version = execSync('pnpm view @djie/cli version', { stdio: 'pipe' }).toString().trim()
  if (latest_version !== version)
    console.log(`有新版本更新啦! 输入: ${chalk.yellow('jie update')} 更新到最新版`)
}
