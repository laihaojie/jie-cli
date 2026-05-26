/* eslint-disable regexp/no-misleading-capturing-group */
import { execFileSync, execSync } from 'node:child_process'
import process from 'node:process'
import chalk from 'chalk'
import { openInBrowser } from '../utils/open'
import { runCmdSync } from '../utils/run'

export async function gitPush(message) {
  if (!message) {
    console.error(chalk.bold.red('请输入提交信息'))
    process.exit(1)
  }
  try {
    execSync('git add .', { stdio: 'inherit' })
    execFileSync('git', ['commit', '-m', message], { stdio: 'inherit' })
    execSync('git push', { stdio: 'inherit' })
  }
  catch (err) {
    console.error(`${chalk.bold.red(`运行出错${err}`)}`)
    process.exit(1)
  }
}

export function openGitRepoByBrowser() {
  const res = execSync('git remote -v', { stdio: 'pipe' }).toString().trim()
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  const match = res.match(/origin\s+(.*)\s+\(fetch\)/)
  if (match?.[1])
    openInBrowser(match[1])
}

export function checkGitStats(): boolean {
  runCmdSync('git config core.hooksPath .gitHooks')

  runCmdSync('git fetch')

  const res = execSync('git status', { stdio: 'pipe' }).toString().trim()
  const branchMatch = res.match(/On branch (.*)/)
  const currentBranch = branchMatch?.[1] || 'unknown'

  const isPull = res.match(/Your branch is behind '.*' by (\d+) commit/)
  const isPush = res.match(/Your branch is ahead of '.*' by (\d+) commit/)
  const pullCountNum = isPull ? +isPull[1] : 0
  const pushCountNum = isPush ? +isPush[1] : 0

  if (pullCountNum > 0) {
    console.error(`当前分支 ${chalk.bold.yellow(currentBranch)} 距离远程分支 ${chalk.bold.yellow(currentBranch)} 有 ${chalk.bold.yellow(pullCountNum)} 个拉取, 请先执行 ${chalk.bold.yellow('git pull')}`)
    process.exit(1)
  }

  if (pushCountNum > 0) {
    console.error(`当前分支 ${chalk.bold.yellow(currentBranch)} 距离远程分支 ${chalk.bold.yellow(currentBranch)} 有 ${chalk.bold.yellow(pushCountNum)} 个提交, 请先执行 ${chalk.bold.yellow('git push')}`)
    process.exit(1)
  }

  return false
}

export function gitPushAll(message) {
  checkGitStats()
  gitPush(message)
}
