import { Command } from 'commander'
import { version } from '../package.json'
import { checkVersion } from './utils/checkVersion'
import { update } from './update'
import { createProject } from './create'
import { frp } from './frp'
import { formatToUTF8 } from './formatToUTF8'

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

  program.command('dir')
    .description('显示json配置文件')
    .action(() => {
      console.dir(111)
    })

  program.version(version, '-v, --version', '查看版本号')
  program.parse()
  checkVersion()
}

