import type { IPty } from 'node-pty'
import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { WebSocketServer } from 'ws'
import { bridgeHost, bridgePort } from './config'
import { getAuthPassword } from './utils/authConfig'
import { getLanIpv4Addresses } from './utils/network'
import { createSessionToken, initSessionSecret, SESSION_COOKIE, SESSION_MAX_AGE, verifySessionToken } from './utils/session'
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
// 鉴权密码：环境变量 JIE_AUTH_TOKEN 优先，否则读 ~/.jie/config.json；空 = 不鉴权
const AUTH_PASSWORD = process.env.JIE_AUTH_TOKEN || getAuthPassword()

// 本机 IPv4 末段（用于前端标题前缀，多设备区分），如 192.168.31.134 → 134
const HOST_SUFFIX = (() => {
  const ips = getLanIpv4Addresses()
  const first = ips[0]
  return first ? first.split('.').pop() ?? '' : ''
})()

// 启用鉴权时初始化会话密钥（进程级随机，重启失效）
if (AUTH_PASSWORD)
  initSessionSecret()

// 登录失败限速：内存 Map<ip, {count, windowStart}>，60s 内失败 5 次拒绝
const LOGIN_LIMIT_WINDOW = 60_000
const LOGIN_LIMIT_MAX = 5
const loginFails = new Map<string, { count: number, windowStart: number }>()

function loginAllowed(ip: string): boolean {
  const now = Date.now()
  const rec = loginFails.get(ip)
  if (!rec || now - rec.windowStart > LOGIN_LIMIT_WINDOW)
    return true
  return rec.count < LOGIN_LIMIT_MAX
}

function recordLoginFail(ip: string): void {
  const now = Date.now()
  const rec = loginFails.get(ip)
  if (!rec || now - rec.windowStart > LOGIN_LIMIT_WINDOW)
    loginFails.set(ip, { count: 1, windowStart: now })
  else
    rec.count++
}

// 恒定时间密码比对
function safeEqualPassword(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length)
    return false
  return crypto.timingSafeEqual(ab, bb)
}

// 从请求头解析 cookie
function parseCookies(req: http.IncomingMessage): Record<string, string> {
  const header = req.headers.cookie
  if (!header)
    return {}
  const cookies: Record<string, string> = {}
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx > 0) {
      const k = part.slice(0, idx).trim()
      const v = part.slice(idx + 1).trim()
      cookies[k] = v
    }
  }
  return cookies
}

// 当前请求是否已通过鉴权（无密码=true；有密码看会话 cookie 或 ?token=）
function isAuthorized(req: http.IncomingMessage, urlObj: URL): boolean {
  if (!AUTH_PASSWORD)
    return true
  const cookieToken = parseCookies(req)[SESSION_COOKIE]
  if (verifySessionToken(cookieToken))
    return true
  const queryToken = urlObj.searchParams.get('token')
  if (queryToken && safeEqualPassword(queryToken, AUTH_PASSWORD))
    return true
  return false
}

function clientIp(req: http.IncomingMessage): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
}

const MIME: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
}

// 前端 SPA 静态资源根（dist/web/）
const WEB_ROOT = path.resolve(__dirname, 'web')

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

// 静态托管 dist/web/ 下的 SPA 资源；不存在则回 index.html（Hash 路由 fallback）
function serveWeb(req: http.ServerResponse, pathname: string): void {
  // 防路径穿越
  const safe = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '')
  let abs = path.join(WEB_ROOT, safe)
  if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory())
    abs = path.join(WEB_ROOT, 'index.html')
  if (!fs.existsSync(abs)) {
    req.statusCode = 404
    req.end('web build not found')
    return
  }
  sendFile(req, abs)
}

// 解析请求体（JSON 或表单）
function readBody(req: http.IncomingMessage, max = 256 * 1024): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    let size = 0
    let done = false
    const finish = (v: string) => {
      if (!done) {
        done = true
        resolve(v)
      }
    }
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > max) {
        req.destroy()
        finish('')
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => finish(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', () => finish(''))
  })
}

function sendJson(res: http.ServerResponse, status: number, obj: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(obj))
}

function setSessionCookie(res: http.ServerResponse): void {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${createSessionToken()}; Max-Age=${SESSION_MAX_AGE}; Path=/; HttpOnly; SameSite=Lax`)
}

function clearSessionCookie(res: http.ServerResponse): void {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`)
}

// 处理登录：校验密码 → 成功设会话 cookie 返回 JSON；失败限速 + 返回 JSON
async function handleLogin(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const ip = clientIp(req)
  const body = await readBody(req)
  let password = ''
  try {
    password = JSON.parse(body || '{}').password ?? ''
  }
  catch {
    // 容错：表单格式
    password = new URLSearchParams(body).get('password') ?? ''
  }

  if (!loginAllowed(ip)) {
    sendJson(res, 429, { ok: false, error: '尝试过于频繁，请稍后再试' })
    return
  }

  if (password && safeEqualPassword(password, AUTH_PASSWORD)) {
    setSessionCookie(res)
    sendJson(res, 200, { ok: true })
    return
  }

  recordLoginFail(ip)
  sendJson(res, 401, { ok: false, error: '密码错误' })
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

  // 健康检查（供 startServer 活性检测，不鉴权）
  if (req.method === 'GET' && pathname === '/health') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ ok: true, service: 'jie-bridge' }))
    return
  }

  // ---- REST API ----
  if (pathname.startsWith('/api/')) {
    // 登录：不要求已登录
    if (req.method === 'POST' && pathname === '/api/login') {
      handleLogin(req, res)
      return
    }
    // 查询登录态：不要求已登录（前端启动时探测是否需要登录）
    if (req.method === 'GET' && pathname === '/api/session') {
      sendJson(res, 200, {
        authRequired: Boolean(AUTH_PASSWORD),
        loggedIn: isAuthorized(req, urlObj),
        hostSuffix: HOST_SUFFIX,
      })
      return
    }
    // 其余 /api 需鉴权（后续模块扩展在此）
    if (!isAuthorized(req, urlObj)) {
      sendJson(res, 401, { ok: false, error: '未登录' })
      return
    }
    if (req.method === 'POST' && pathname === '/api/logout') {
      clearSessionCookie(res)
      sendJson(res, 200, { ok: true })
      return
    }
    sendJson(res, 404, { ok: false, error: 'api not found' })
    return
  }

  // ---- 静态 SPA + 资源（鉴权后）----
  // 已配置密码且未登录 → 仍返回 index.html（前端路由守卫跳登录），保证 SPA 入口可加载
  if (req.method === 'GET') {
    serveWeb(res, pathname === '/' ? 'index.html' : pathname)
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
  // 鉴权：无密码放行；有密码需有效会话 cookie 或 ?token=<密码>
  if (AUTH_PASSWORD && !isAuthorized(req, urlObj)) {
    socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n')
    socket.destroy()
    return
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
  if (AUTH_PASSWORD)
    console.log('[bridge] ✓ 已启用密码鉴权，访问网页需登录')
  else
    console.log('[bridge] ⚠️ 未启用鉴权，同网任何人可执行命令（jie passwd 设置密码）')
})

process.on('SIGTERM', () => {
  console.log('[bridge] 收到 SIGTERM，关闭服务')
  wss.close()
  server.close(() => process.exit(0))
})
