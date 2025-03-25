import fs from 'node:fs'
import process from 'node:process'
import chalk from 'chalk'
import { Command, Option } from 'commander'
import { version } from '../package.json'
import { clean } from './commands/clean'
import { createProject } from './commands/create'
import { eslint } from './commands/eslint'
import { gitPushAll, openGitRepoByBrowser } from './commands/git'
import { imgToIcoMini } from './commands/ico_mini'
import { getSharpFormat, imgResize } from './commands/img'
import { info } from './commands/info'
import { killPort } from './commands/kill'
import { random } from './commands/random'
import { rb } from './commands/rb'
import { startServer } from './commands/server'
import { update } from './commands/update'
import { checkVersion } from './utils/checkVersion'
import { openInBrowser } from './utils/open'
import { Platform } from './utils/platform'
import { runCmdSync } from './utils/run'

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
    .argument('[message...]', '提交信息')
    .description('提交代码')
    .action((message) => {
      gitPushAll(message.join(' '))
    })

  program
    .command('.')
    .description('打开当前文件夹')
    .action(() => {
      if (Platform.isWin)
        runCmdSync('explorer .')
      else
        runCmdSync('open .')
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
    .argument('[files...]', '文件列表')
    .option('-a, --all', '清除所有')
    .action((files, ops) => {
      if (ops.all) {
        const files = fs.readdirSync(process.cwd())
        clean(files)
        return
      }
      clean(files)
    })

  program
    .command('random')
    .argument('<type>', '类型')
    .argument('[length]', '长度')
    .description('生成随机字符串或数字')
    .action((...args) => {
      random(args)
    })

  program
    .command('eslint')
    .description('创建eslint配置文件')
    .action(() => {
      eslint()
    })

  program
    .command('kill')
    .argument('<port>', '端口号')
    .description('杀死端口')
    .action((port) => {
      killPort(port)
    })

  // rb run
  // rb set
  // rb get
  program
    .command('rb')
    .argument('<action>', '操作')
    .argument('[args...]', '参数')
    .description('日报')
    .action((action, args) => {
      rb(action, args)
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
    .addOption(new Option('-t, --type <type>', '输出格式类型').choices(getSharpFormat()))
    .addOption(new Option('-f, --fit <fit>', '图片转换模式, 同css object-fit').default('cover').choices(['cover', 'contain', 'fill', 'inside', 'outside']))
    .option('-q, --quality <quality>', '转换图片质量1-100', (val) => {
      const quality = Number(val)

      if (Number.isNaN(quality))
        throw new Error('请输入数字')
      if (quality < 1 || quality > 100)
        throw new Error('请输入1-100之间的数字')

      return quality
    })
    .option('-z, --zip', '是否输出压缩包')
    .option('-i, --info', '是否输出图片信息')
    .description('图片转换, 图片格式，大小，旋转，重命名，填充模式，输出路径，压缩包等')
    .action((img_path, options) => {
      imgResize(img_path, options)
    })

  program
    .command('ico')
    .argument('<img_path>', '需要转换的图片路径, 可以是文件路径或者图片URL')
    .option('-o, --output <output_path>', '输出路径')
    .option('-s, --size <size>', 'ico尺寸', val => Number(val))
    .option('-n, --name <name>', '输出文件名')
    .option('-z, --zip', '是否输出压缩包')
    .description('ico png 互相转换')
    .action((img_path, options) => {
      imgToIcoMini(img_path, options)
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
