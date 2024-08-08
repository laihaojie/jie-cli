import fs from 'node:fs'
import { spawn } from 'node:child_process'
import process from 'node:process'
import path from 'node:path'
import chalk from 'chalk'
import { RbActionMeta } from '../config'
import { rootDir } from '../utils/store'

function runRb() {
  const rbFilePath = path.join(rootDir, 'rb.js')

  const server = spawn(process.argv[0], [rbFilePath], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  server.unref()
}

export function rb(action: RbActionMeta, arg: string[]) {
  console.log(chalk.green(`${action} ${arg.join(' ')}`))

  const projectMetaFilePath = path.join(rootDir, 'projectMeta.json')
  if (!fs.existsSync(projectMetaFilePath)) {
    fs.writeFileSync(projectMetaFilePath, JSON.stringify({}))
  }
  const logFilePath = path.join(rootDir, 'log.txt')

  if (action === RbActionMeta.run) {
    runRb()
  }
  else if (action === RbActionMeta.get) {
    const key = arg[0]
    const projectMeta = JSON.parse(fs.readFileSync(projectMetaFilePath, 'utf-8'))
    if (Object.keys(projectMeta).length === 0 || !projectMeta[key]) {
      console.log(chalk.red('未找到对应的值'))
      return
    }
    console.log(projectMeta[key])
  }
  else if (action === RbActionMeta.set) {
    const expression = arg[0]

    if (!expression) {
      console.log(chalk.red('参数错误 请传入表达式'))
      process.exit(1)
    }
    const [key, value] = expression.split('=')
    if (!key || !value) {
      console.log(chalk.red('参数错误 请传入正确的表达式'))
      process.exit(1)
    }

    const projectMeta = JSON.parse(fs.readFileSync(projectMetaFilePath, 'utf-8'))
    projectMeta[key] = value
    fs.writeFileSync(projectMetaFilePath, JSON.stringify(projectMeta, null, 2))
    console.log(chalk.green('设置成功'))
  }
  else if (action === RbActionMeta.log) {
    const logTxt = fs.readFileSync(logFilePath, 'utf-8')
    console.log(logTxt)
  }
  else {
    console.log(chalk.red('未知的命令'))
  }
}
