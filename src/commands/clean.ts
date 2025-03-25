import fs from 'node:fs'
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
  for (const value of args) {
    if (value.startsWith('/') || value.startsWith('\\')) {
      console.log(chalk.red(chalk.bold('禁止清除根目录')))
      return
    }

    // await rimraf(value)
    const startStr = chalk(`清除 ${chalk.bold(value)}`)
    const spinner = ora(startStr).start()
    try {
      await runCmd(`rm -rf ${value}`) // 等待当前任务完成
      const endStr = chalk.green(`清除 ${chalk.bold(value)} 成功`)
      spinner.succeed(endStr)
    }
    catch {
      spinner.fail(chalk.red(`清除 ${chalk.bold(value)} 失败`))
    }
  }
}
