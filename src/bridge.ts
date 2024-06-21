import http from 'node:http'
import fs from 'node:fs'
import process from 'node:process'
import { runCmdGetRes } from './utils/run'

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

function handlePost(req, res) {
  // 获取请求体
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', () => {
    try {
      // 解析请求体
      let data = {} as Record<string, string>
      try {
        data = JSON.parse(body)
      }
      catch (error) {
        R.error(res, '请求体解析失败')
        return
      }
      const { cmd, shell = '', cwd } = data
      if (!cmd) {
        R.error(res, '缺少指令配置')
        return
      }
      if (cwd) {
        if (!fs.existsSync(cwd)) {
          R.success(res, { data: '目录不存在', cwd: '' })
          return
        }
      }

      const isPowerShell = shell.includes('powershell')
      let command = ''
      if (isPowerShell)
        command = `${cmd}; echo __jie__; pwd; echo __jie__`
      else
        command = `${cmd} && echo __jie__ && pwd && echo __jie__`

      let str = runCmdGetRes(command, { shell: shell || undefined, cwd: cwd || undefined })

      if (str.trim().startsWith('__jie__')) str = `\n${str}`

      const templateReg = /[^echo  ]__jie__\s*([\s\S]*?)\s*__jie__/

      let wd = ''
      const currentWorkDir = str.match(templateReg)?.[1] || ''

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

      // 处理请求体
      R.success(res, { data: str.replace(templateReg, '').replace(/\n$/, ''), cwd: wd })
    }
    catch (error) {
      R.error(res, '未知错误')
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
