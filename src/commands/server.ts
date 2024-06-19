import path from 'node:path'
import { spawn } from 'node:child_process'
import process from 'node:process'

export function startServer() {
  const serverFilePath = path.resolve(__dirname, 'bridge.cjs')
  const localServer = 'http://127.0.0.1:32677'
  // 判断是否已经启动服务 活性检测 请求 http://127.0.0.1:32677
  fetch(localServer).then(() => {
    globalThis.__IS_RUNNING = true
  }).catch(() => {
    // runCmd(`pm2 start "${serverFilePath}" --name bridge --stop-exit-codes 0`)
    const server = spawn(process.argv[0], [serverFilePath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    })
    server.unref()
    fetch(localServer)
      .then(() => { globalThis.__IS_RUNNING = true })
      .catch(() => { globalThis.__IS_RUNNING = false })
  })
}
