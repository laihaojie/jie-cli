import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import { localServer } from '../config'
import { getLanIpv4Addresses } from '../utils/network'

const serverFilePath = path.resolve(__dirname, 'bridge.cjs')
const healthUrl = `${localServer}/health`

async function fetchWithTimeout(url: string, timeout = 3000): Promise<Response> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { signal: controller.signal })
  }
  finally {
    clearTimeout(t)
  }
}

// 轮询健康检查直到就绪或超时（bridge 启动需要时间）
async function pollHealth(url: string, timeoutMs: number): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetchWithTimeout(url, 1000)
      if (res.ok)
        return true
    }
    catch {
      // 未就绪，继续轮询
    }
    await new Promise(r => setTimeout(r, 200))
  }
  return false
}

// 打印局域网访问信息与风险提示（首次拉起时调用）
export function printServerInfo(): void {
  const port = new URL(localServer).port
  const ips = getLanIpv4Addresses()
  console.log('')
  console.log(chalk.yellow('⚠️  局域网网页终端已启动（未启用鉴权，同网任何人可执行命令）'))
  console.log(chalk.cyan(`   本机访问  : http://localhost:${port}`))
  for (const ip of ips)
    console.log(chalk.cyan(`   局域网访问: http://${ip}:${port}`))
  console.log(chalk.gray('   其他设备用浏览器打开以上地址即可获得终端'))
  console.log('')
}

export async function startServer(): Promise<void> {
  const urlObj = new URL(localServer)
  if (process.argv.join(' ').includes(`kill ${urlObj.port}`) || process.argv.join(' ').includes('kill server'))
    return

  if (!fs.existsSync(serverFilePath)) {
    globalThis.__IS_RUNNING = false
    return
  }

  // 已在运行 → 仅置标记，不重复打印
  try {
    const res = await fetchWithTimeout(healthUrl, 1500)
    if (res.ok) {
      globalThis.__IS_RUNNING = true
      return
    }
  }
  catch {
    // 未运行，继续拉起
  }

  // 拉起后台 bridge 进程（detached，独立生命周期）
  const server = spawn(process.argv[0], [serverFilePath], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  server.unref()

  // 等待就绪后打印访问信息（仅本次新拉起）
  const ok = await pollHealth(healthUrl, 8000)
  globalThis.__IS_RUNNING = ok
  if (ok)
    printServerInfo()
}
