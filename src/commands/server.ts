import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { localServer } from '../config'

const serverFilePath = path.resolve(__dirname, 'bridge.cjs')

async function fetchWithTimeout(url: string, timeout = 3000): Promise<Response> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  }
  finally {
    clearTimeout(t)
  }
}

export function startServer() {
  const urlObj = new URL(localServer)

  if (process.argv.join(' ').includes(`kill ${urlObj.port}`) || process.argv.join(' ').includes('kill server')) return

  if (!fs.existsSync(serverFilePath)) {
    globalThis.__IS_RUNNING = false
    return
  }

  // 判断是否已经启动服务 活性检测 请求 http://127.0.0.1:32677
  fetchWithTimeout(localServer, 2000).then(() => {
    globalThis.__IS_RUNNING = true
  }).catch(() => {
    const server = spawn(process.argv[0], [serverFilePath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    })
    server.unref()
    fetchWithTimeout(localServer, 5000)
      .then(() => { globalThis.__IS_RUNNING = true })
      .catch(() => { globalThis.__IS_RUNNING = false })
  })
}
