import fs from 'node:fs'
import process from 'node:process'
import { Command, Option } from 'commander'
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
import { rb } from './commands/rb'
import { generatePwaIcon, getSharpFormat, imgResize } from './commands/img'

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

  program
    .command('push')
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

  // rb run
  // rb set
  // rb get
  program
    .command('rb')
    .argument('<action>')
    .description('日报')
    .action((action) => {
      rb(action, program.args.slice(2))
    })

  program
    .command('pwa')
    .argument('<icon_path>', '需要转换的icon路径，输出默认在icon同级目录下')
    .description('生成pwa图标')
    .action((icon_path) => {
      imgResize(icon_path, { width: [192, 512], height: [], name: 'icon' })
    })

  function stringToNumber(val: string, prev: number[]) {
    const numList = val.split(/[,，]/).filter(Boolean).map(Number)
    if (numList.some(Number.isNaN))
      throw new Error('请输入数字')

    if (numList.some(num => num <= 0))
      throw new Error('请输入正整数')

    if (numList.length === 0)
      return prev

    return [...new Set(prev.concat(numList))]
  }

  program
    .command('img')
    .argument('<img_path>', '需要转换的图片路径, 可以是文件路径或者图片URL')
    .option('-o, --output <output_path>', '输出路径')
    .option('-w, --width <width>', '宽度', stringToNumber, [])
    .option('-h, --height <height>', '高度', stringToNumber, [])
    .option('-n, --name <name>', '输出文件名')
    .option('-r, --rotate <rotate>', '旋转角度', val => Number(val))
    .addOption(new Option('-t, --type <图片格式>', '输出格式类型').choices(getSharpFormat()))
    .addOption(new Option('-f, --fit <图片转换模式>', '图片转换模式, 同css object-fit').default('cover').choices(['cover', 'contain', 'fill', 'inside', 'outside']))
    .option('-z, --zip', '是否输出压缩包')
    .option('-i, --info', '是否输出图片信息')
    .description('图片转换, 图片格式，大小，旋转，重命名，填充模式，输出路径，压缩包等')
    .action((img_path, options) => {
      imgResize(img_path, options)
    })

  program
    .command('test')
    .argument('<test>', '测试')
    .option('-a, --all ', '所有')
    .option('--debug-server', 'debug')
    .option('-w, --width <宽度>', '宽度', stringToNumber, [])
    .option('-h, --height <高度>', '高度', stringToNumber, [])
    // .option('--zip <name>', '是否输出压缩包', val => val || 'zipsx', 'zipsx')
    .option('-r, --rotate <rotate>', '旋转角度', val => Number(val))
    .addOption(new Option('-z, --zip <name>', '是否输出压缩包').default('zipsx'))
    .addOption(new Option('-t, --type <格式>', '输出格式类型').choices(['jpg', 'png']))
    .addOption(new Option('-f, --fit <图片转换模式>', '图片转换模式, 同css object-fit').default('cover').choices(['cover', 'contain', 'fill', 'inside', 'outside']))
    .description('测试 命令行解析参数')
    .action((...args) => {
      console.log(args.slice(0, -1))
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
