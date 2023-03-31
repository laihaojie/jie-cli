import { Command } from 'commander'
import { version } from '../package.json'
import { createProject } from './create'
import { formatToUTF8 } from './formatToUTF8'
import { frp } from './frp'
import { gitPushAll, openGitRepoByBrowser } from './git'
import { update } from './update'
import { checkVersion } from './utils/checkVersion'
import { openInBrowser } from './utils/open'
import { Platform } from './utils/platform'
import { runCmd } from './utils/run'

const program = new Command()

export default async function () {
  program
    .command('create')
    .description('创建项目')
    .action(() => {
      createProject()
    })

  program
    .command('frp')
    .description('开启内网穿透')
    .action(() => {
      frp()
    })

  program
    .command('utf8')
    .description('格式化文件编码为 utf8')
    .action(() => {
      formatToUTF8()
    })

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

  program.version(version, '-v, --version', '查看版本号')
  program.parse()
  checkVersion()
}

