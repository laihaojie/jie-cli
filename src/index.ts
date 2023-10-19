import fs from 'node:fs'
import { Command } from 'commander'
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

const program = new Command()

export default async function () {
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

  program.version(version, '-v, --version', '查看版本号')
  program.parse()
  checkVersion()
}

