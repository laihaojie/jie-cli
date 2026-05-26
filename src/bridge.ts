import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import http from 'node:http'
import process from 'node:process'
import { runCmdGetRes } from './utils/run'
// import { WebSocketServer } from 'ws'
// import * as pty from 'node-pty'

// Create an HTTP server
const server = http.createServer((req, res) => {
  // 解决跨域问题
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  // 获取请求方法和请求路径
  const { method, url } = req
  if (method === 'GET' && url === '/')
    handleGet(req, res)

  if (method === 'POST' && url === '/')
    handlePost(req, res)

  if (method === 'OPTIONS')
    res.end()
})

// const wss = new WebSocketServer({ server });

// wss.on('connection', (ws) => {
//   // 创建伪终端
//   const term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
//     name: 'xterm-color',
//     cols: 80,
//     rows: 24,
//     cwd: process.env.HOME,
//     env: process.env
//   });

//   // 终端数据 -> 发送给前端
//   term.onData(data => ws.send(data));

//   // 前端消息 -> 写入终端
//   ws.on('message', (data) => {
//     term.write(data.toString());
//   });

//   // 关闭处理
//   ws.on('close', () => {
//     term.kill();
//   });
// });

class R {
  static success(res, data) {
    res.write(JSON.stringify({ code: 1, data }))
    res.end()
  }

  static error(res, data) {
    res.write(JSON.stringify({ code: 3, data }))
    res.end()
  }
}

function handleGet(req, res) {
  res.write('jie bridge')
  res.end()
}

const MAX_BODY_SIZE = 1024 * 1024 // 1MB

function sanitizeCmd(cmd: string): boolean {
  // 拒绝包含高危 shell 元字符的命令（管道、命令替换、反引号）
  // 允许常见的 && ; 等组合符，因为实际业务场景需要
  return !/[|`\\]/.test(cmd) && !/\$\(/.test(cmd) && !/\$\{/.test(cmd)
}

function handlePost(req, res) {
  // 获取请求体
  const chunks: Buffer[] = []
  let bodySize = 0
  req.on('data', (chunk) => {
    bodySize += chunk.length
    if (bodySize > MAX_BODY_SIZE) {
      req.destroy()
      R.error(res, '请求体过大')
      return
    }
    chunks.push(chunk)
  })
  req.on('end', () => {
    try {
      // 解析请求体
      let data = {} as Record<string, string>
      const body = Buffer.concat(chunks).toString('utf-8')
      try {
        data = JSON.parse(body)
      }
      catch (error) {
        R.error(res, `请求体解析失败${error}`)
        return
      }
      const { cmd, shell = '', cwd } = data
      if (!cmd) {
        R.error(res, '缺少指令配置')
        return
      }
      if (!sanitizeCmd(cmd)) {
        R.error(res, '指令包含非法字符')
        return
      }
      if (cwd) {
        if (!fs.existsSync(cwd)) {
          R.success(res, { data: '目录不存在', cwd: '' })
          return
        }
      }

      const isPowerShell = /powershell/i.test(shell)
      let command = ''
      if (isPowerShell)
        command = `${cmd}; echo __jie__; pwd; echo __jie__`
      else
        command = `${cmd} && echo __jie__ && pwd && echo __jie__`

      let str = runCmdGetRes(command, { shell: shell || undefined, cwd: cwd || undefined })

      if (str.trim().startsWith('__jie__')) str = `\n${str}`

      let wd = ''
      // 用字符串 split 替代正则，避免回溯风险
      const parts = str.split('__jie__')
      const currentWorkDir = parts.length >= 3 ? parts[1] : ''

      if (!currentWorkDir) {
        R.success(res, { data: `Command failed: ${cmd}`, cwd: '' })
        return
      }

      if (isPowerShell) {
        wd = currentWorkDir.trim().match(/.*$/)?.[0].trim() || ''
        if (wd.match(/Path\s+:/)) {
          wd = wd.replace(/Path\s+:/, '').trim()
        }
      }

      else {
        wd = currentWorkDir.replace(/^[\\/](\w)[\\/]/, (_, $1) => (`${$1.toUpperCase()}:/`)).trim()
      }

      // 处理请求体：移除 __jie__ 标记及其包裹的内容
      const dataStr = parts.filter((_p, i) => i !== 1).join('__jie__').replace(/\n$/, '')
      R.success(res, { data: dataStr, cwd: wd })
    }
    catch (error) {
      R.error(res, `未知错误${error}`)
    }
  })
}

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err)
})

process.on('unhandledRejection', (err) => {
  console.error('unhandledRejection', err)
})

// Listen on port 32677
server.listen(32677, () => {
  console.log('Server is running...')
})

// 捕获退出事件
process.on('SIGTERM', () => {
  console.log('Daemon process terminated.')
  server.close(() => {
    process.exit(0)
  })
})
