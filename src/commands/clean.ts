import fs from 'node:fs'
import { rimraf } from 'rimraf'
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
  const spinner = ora()

  for (const value of args) {
    if (!fs.existsSync(value))
      continue

    if (value.startsWith('/') || value.startsWith('\\')) {
      console.log(chalk.red(chalk.bold('禁止清除根目录')))
      return
    }

    spinner.start(chalk(`清除 ${chalk.bold(value)}`))
    // await rimraf(value)
    runCmd(`rm -rf ${value}`)
    spinner.succeed(chalk.green(`清除 ${chalk.bold(value)}`))
  }
}
