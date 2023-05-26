import fs from 'node:fs'
import { rimrafSync } from 'rimraf'
import chalk from 'chalk'

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

    console.log(chalk.bold.green(`清除 ${clean}`))
    rimrafSync(clean)
    console.log(chalk.bold.green(`清除 ${clean} 成功`))
  })
}
