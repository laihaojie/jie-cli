import type { IPty } from 'node-pty'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { WebSocketServer } from 'ws'
import { bridgeAuthToken, bridgeHost, bridgePort } from './config'
import { getTerminalHtml } from './terminalHtml'
import { getGitBashPath } from './utils/terminal'

// 运行时加载 node-pty（原生模块），失败时给出友好提示而非裸崩
let pty: typeof import('node-pty')
try {
  // eslint-disable-next-line ts/no-require-imports
  pty = require('node-pty')
}
catch (e) {
  console.error('')
  console.error('[bridge] ❌ 加载 node-pty 原生模块失败，网页终端无法启动。')
  console.error('    常见原因与处理：')
  console.error('    • pnpm 安装忽略了构建脚本 → 运行 pnpm approve-builds 选择 node-pty（Win/mac 不 approve 也能用，靠系统 ConPTY）')
  console.error('    • Linux 无预编译包 → 先装 Python + 编译工具链(build-essential/make/g++) 再重装')
  console.error(`    详细错误：${(e as Error).message}`)
  console.error('')
  process.exit(1)
}

// 运行时配置（可由环境变量覆盖，默认取 config）
const PORT = Number(process.env.JIE_BRIDGE_PORT) || bridgePort
const HOST = process.env.JIE_BRIDGE_HOST || bridgeHost
const AUTH_TOKEN = process.env.JIE_AUTH_TOKEN || bridgeAuthToken // 空 = 不鉴权（默认信任内网）

const MIME: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
}

interface ShellSpec { file: string, args: string[] }

// 解析 shell：query 优先 → 默认 Git Bash（win）→ 回退 powershell/cmd → sh（unix）
function resolveShell(shellQuery?: string | null): ShellSpec {
  if (shellQuery) {
    const q = shellQuery.toLowerCase()
    if (q === 'bash' || q === 'sh') {
      const b = process.platform === 'win32' ? (getGitBashPath() || 'bash') : (process.env.SHELL || 'bash')
      return { file: b, args: [] }
    }
    if (q === 'powershell' || q === 'pwsh')
      return { file: q === 'pwsh' ? 'pwsh.exe' : 'powershell.exe', args: ['-NoLogo'] }
    if (q === 'cmd')
      return { file: 'cmd.exe', args: [] }
    // 视为自定义可执行路径
    return { file: shellQuery, args: [] }
  }
  if (process.platform === 'win32') {
    const bash = getGitBashPath()
    if (bash)
      return { file: bash, args: ['--login'] }
    return { file: 'powershell.exe', args: ['-NoLogo'] }
  }
  return { file: process.env.SHELL || 'bash', args: [] }
}

// xterm 静态资源映射（运行时 require.resolve，需 external 这些包）
const ASSET_MODULES: Record<string, string> = {
  '/xterm.js': '@xterm/xterm/lib/xterm.js',
  '/xterm.css': '@xterm/xterm/css/xterm.css',
  '/addon-fit.js': '@xterm/addon-fit/lib/addon-fit.js',
}

function sendFile(res: http.ServerResponse, absPath: string): void {
  try {
    const data = fs.readFileSync(absPath)
    res.setHeader('Content-Type', MIME[path.extname(absPath)] || 'application/octet-stream')
    res.end(data)
  }
  catch {
    res.statusCode = 500
    res.end('asset read failed')
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  const urlObj = new URL(req.url || '/', `http://${req.headers.host || HOST}`)
  const pathname = urlObj.pathname

  if (req.method === 'OPTIONS') {
    res.end()
    return
  }

  // 健康检查（供 startServer 活性检测）
  if (req.method === 'GET' && pathname === '/health') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ ok: true, service: 'jie-bridge' }))
    return
  }

  // 终端网页
  if (req.method === 'GET' && pathname === '/') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(getTerminalHtml())
    return
  }

  // xterm 静态资源
  if (req.method === 'GET' && ASSET_MODULES[pathname]) {
    try {
      const abs = require.resolve(ASSET_MODULES[pathname])
      sendFile(res, abs)
    }
    catch {
      res.statusCode = 500
      res.end('asset resolve failed')
    }
    return
  }

  res.statusCode = 404
  res.end('Not Found')
})

// WebSocket 终端：每条连接创建一个真实 PTY，双向转发
const wss = new WebSocketServer({ noServer: true })

server.on('upgrade', (req, socket, head) => {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || HOST}`)
  if (urlObj.pathname !== '/ws') {
    socket.destroy()
    return
  }
  // 鉴权钩子（默认放行，AUTH_TOKEN 为空时不校验）
  if (AUTH_TOKEN) {
    const token = urlObj.searchParams.get('token')
    if (token !== AUTH_TOKEN) {
      socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n')
      socket.destroy()
      return
    }
  }
  wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req))
})

wss.on('connection', (ws, req) => {
  const urlObj = new URL(req.url || '/ws', `http://${req.headers.host || HOST}`)
  const cols = Math.min(400, Math.max(10, Number(urlObj.searchParams.get('cols')) || 80))
  const rows = Math.min(120, Math.max(2, Number(urlObj.searchParams.get('rows')) || 24))
  const { file, args } = resolveShell(urlObj.searchParams.get('shell'))

  let term: IPty
  try {
    term = pty.spawn(file, args, {
      name: 'xterm-256color',
      cols,
      rows,
      cwd: os.homedir(),
      env: process.env as Record<string, string>,
      useConpty: process.platform === 'win32',
    })
  }
  catch (e) {
    try {
      ws.send(`\r\n[启动 shell 失败: ${file}]\r\n${String(e)}`)
    }
    catch {}
    ws.close()
    return
  }

  console.log(`[bridge] 终端连接 pid=${term.pid} shell=${file} ${cols}x${rows}`)

  // 终端输出 → 浏览器
  term.onData((data) => {
    if (ws.readyState === 1)
      ws.send(data)
  })

  // 进程退出 → 关闭连接
  term.onExit(({ exitCode }) => {
    try {
      ws.send(`\r\n[进程已退出，代码 ${exitCode}]`)
    }
    catch {}
    try {
      ws.close()
    }
    catch {}
  })

  // 浏览器输入 → 终端（JSON 控制消息用于 resize）
  ws.on('message', (msg) => {
    const raw = msg.toString()
    if (raw.charCodeAt(0) === 123 /* '{' */) {
      try {
        const ctrl = JSON.parse(raw)
        if (ctrl && ctrl.type === 'resize' && ctrl.cols && ctrl.rows) {
          try {
            term.resize(Math.max(1, Number(ctrl.cols)), Math.max(1, Number(ctrl.rows)))
          }
          catch {}
          return
        }
      }
      catch {
        // 非合法 JSON → 按普通输入处理
      }
    }
    term.write(raw)
  })

  // 连接关闭/出错 → 释放 PTY，不留僵尸
  const cleanup = () => {
    try {
      term.kill()
    }
    catch {}
  }
  ws.on('close', cleanup)
  ws.on('error', cleanup)
})

process.on('uncaughtException', (err) => {
  console.error('[bridge] uncaughtException', err)
})
process.on('unhandledRejection', (err) => {
  console.error('[bridge] unhandledRejection', err)
})

server.listen(PORT, HOST, () => {
  console.log(`[bridge] 监听 ${HOST}:${PORT}`)
  if (!AUTH_TOKEN)
    console.log('[bridge] ⚠️ 未启用鉴权，同网任何人可执行命令')
})

process.on('SIGTERM', () => {
  console.log('[bridge] 收到 SIGTERM，关闭服务')
  wss.close()
  server.close(() => process.exit(0))
})
