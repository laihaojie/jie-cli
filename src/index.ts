import fs from 'node:fs'
import process from 'node:process'
import { Command } from 'commander'
import chalk from 'chalk'
import { version } from '../package.json'
import { checkVersion } from './utils/checkVersion'
import { openInBrowser } from './utils/open'
import { Platform } from './utils/platform'
import { runCmd } from './utils/run'
import { clean } from './commands/clean'
import { gitPushAll, openGitRepoByBrowser } from './commands/git'
import { random } from './commands/random'
import { update } from './commands/update'
import { createProject } from './commands/create'
import { eslint } from './commands/eslint'
import { killPort } from './commands/kill'
import { startServer } from './commands/server'
import { info } from './commands/info'

export default async function () {
  startServer()

  const program = new Command()

  program
    .command('info')
    .description('查看脚手架信息')
    .action(() => {
      info()
    })

  program
    .command('create')
    .description('创建项目')
    .action(() => {
      createProject()
    })

  // program
  //   .command('frp')
  //   .description('开启内网穿透')
  //   .action(() => {
  //     frp()
  //   })
  program
    .command('update')
    .description('更新脚手架')
    .action(() => {
      update()
    })

  program.command('push')
    .description('提交代码')
    .action(() => {
      gitPushAll(program.args.slice(1).join(' '))
    })

  program
    .command('.')
    .description('打开当前文件夹')
    .action(() => {
      if (Platform.isWin)
        runCmd('explorer .')
      else
        runCmd('open .')
    })

  program
    .command('repo')
    .description('打开当前git仓库')
    .action(() => {
      openGitRepoByBrowser()
    })

  program
    .command('doc')
    .description('打开阿杰的文档')
    .action(() => {
      openInBrowser('https://docs.laihaojie.com/')
    })

  program
    .command('clean')
    .description('清除文件')
    .option('-a, --all', '清除所有')
    .action((ops) => {
      if (ops.all) {
        const files = fs.readdirSync(process.cwd())
        clean(files)
        return
      }
      clean(program.args.slice(1))
    })

  program
    .command('random')
    .description('生成随机字符串或数字')
    .action(() => {
      random(program.args.slice(1))
    })

  program
    .command('eslint')
    .description('创建eslint配置文件')
    .action(() => {
      eslint()
    })

  program
    .command('kill')
    .description('杀死端口')
    .action(() => {
      killPort(program.args.slice(1))
    })

  program.option('-v, --version', '查看版本号')

  program.action(() => {
    const options = program.opts()
    if (options.version)
      console.log(`v${version}`)

    else
      console.log(program.helpInformation())
  })

  program.parse()
  checkVersion()
}

// 捕获全局异常
process.on('uncaughtException', (err) => {
  console.error(chalk.red('异常信息：', err.message))
})
