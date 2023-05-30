import fs from 'node:fs'
import { rimrafSync } from 'rimraf'
import chalk from 'chalk'
import ora from 'ora'

export function clean(args: string[]) {
  if (args.length) return cleanByPath(...args)

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

function cleanByPath(...args: string[]) {
  args.forEach((clean) => {
    // 判断是否存在
    if (!fs.existsSync(clean)) return

    const spinner = ora({ text: chalk(`清除 ${chalk.bold(clean)}`) }).start()
    rimrafSync(clean)
    spinner.succeed(chalk.green(`清除 ${chalk.bold(clean)}`))
  })
}
