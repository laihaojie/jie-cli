import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import ora from 'ora'
import { runCmd } from '../utils/run'

export function clean(args: string[]): any {
  if (args.length)
    return cleanByPath(...args)

  const cleans = [
    'node_modules',
    'dist',
    'build',
    'package-lock.json',
    'yarn.lock',
    'npm-debug.log',
    'pnpm-lock.yaml',
    'pnpm-debug.log',
    'yarn-error.log',
    'yarn-debug.log',
  ]

  cleanByPath(...cleans)
}

// function cleanByPath(...args: string[]) {
//   const spinner = ora()

//   next(args[Symbol.iterator]())

//   async function next(iterator) {
//     const result = iterator.next()

//     if (result.done) return

//     const value = result.value

//     if (!fs.existsSync(value)) return

//     spinner.start(chalk(`清除 ${chalk.bold(value)}`))
//     await rimraf(value)
//     spinner.succeed(chalk.green(`清除 ${chalk.bold(value)}`))
//     next(iterator)
//   }
// }
async function cleanByPath(...args: string[]) {
  args = args.filter(fs.existsSync)
  for (const rawValue of args) {
    const value = path.resolve(rawValue)
    const cwd = process.cwd()
    // 禁止清除根目录、系统目录或当前工作目录的上级逃逸
    if (value === '/' || value === '\\' || /^[a-z]:[\\/]$/i.test(value) || !value.startsWith(cwd)) {
      console.log(chalk.red(chalk.bold('禁止清除根目录或工作目录之外的文件')))
      return
    }

    const relative = path.relative(cwd, value)
    const startStr = chalk(`清除 ${chalk.bold(relative)}`)
    const spinner = ora(startStr).start()
    try {
      await runCmd(`rm -rf "${value}"`) // 等待当前任务完成
      const endStr = chalk.green(`清除 ${chalk.bold(relative)} 成功`)
      spinner.succeed(endStr)
    }
    catch {
      spinner.fail(chalk.red(`清除 ${chalk.bold(relative)} 失败`))
    }
  }
}
