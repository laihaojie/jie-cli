import { execSync } from 'node:child_process'
import process from 'node:process'
import chalk from 'chalk'
import { openInBrowser } from '../utils/open'
import { runCmd } from '../utils/run'

export async function gitPush(message) {
  if (!message) {
    console.error(chalk.bold.red('请输入提交信息'))
    process.exit(1)
  }
  try {
    execSync('git add .', { stdio: 'inherit' })
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' })
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
  const url = res.match(/origin\s+(.*)\s+\(fetch\)/)[1]
  if (url)
    openInBrowser(url)
}

export function checkGitStats() {
  runCmd('git config core.hooksPath .gitHooks')

  runCmd('git fetch')

  const res = execSync('git status', { stdio: 'pipe' }).toString().trim()
  const currentBranch = res.match(/On branch (.*)/)[1]

  const isPull = res.match(/Your branch is behind '.*' by (\d+) commit/) || [0, 0]
  const isPush = res.match(/Your branch is ahead of '.*' by (\d+) commit/) || [0, 0]
  const pullCountNum = +isPull[1]
  const pushCountNum = +isPush[1]

  if (isPull[0] && pullCountNum > 0) {
    console.error(`当前分支 ${chalk.bold.yellow(currentBranch)} 距离远程分支 ${chalk.bold.yellow(currentBranch)} 有 ${chalk.bold.yellow(pullCountNum)} 个拉取, 请先执行 ${chalk.bold.yellow('git pull')}`)
    process.exit(1)
  }

  if (isPush[0] && pushCountNum > 0) {
    console.error(`当前分支 ${chalk.bold.yellow(currentBranch)} 距离远程分支 ${chalk.bold.yellow(currentBranch)} 有 ${chalk.bold.yellow(pushCountNum)} 个提交, 请先执行 ${chalk.bold.yellow('git push')}`)
    process.exit(1)
  }

  return false
}

export function gitPushAll(message) {
  if (checkGitStats())
    return
  gitPush(message)
}
