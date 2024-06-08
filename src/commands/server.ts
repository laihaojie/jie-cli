import path from 'node:path'
import { spawn } from 'node:child_process'
import process from 'node:process'
import chalk from 'chalk'

export function startServer() {
  const serverFilePath = path.resolve(__dirname, 'bridge.cjs')

  // 判断是否已经启动服务 活性检测 请求 http://127.0.0.1:32677
  fetch('http://127.0.0.1:32677').then(() => {
    console.log('服务已经启动')
  }).catch(() => {
    console.log('正在启动服务....')
    // runCmd(`pm2 start "${serverFilePath}" --name bridge --stop-exit-codes 0`)
    const server = spawn(process.argv[0], [serverFilePath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    })

    server.unref()
    console.log(chalk.green(chalk.bold('服务启动成功')))
  })
}
