import http from 'node:http'
import process from 'node:process'
import { runCmdGetRes } from './src/utils/run'

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
  static success(data) {
    return JSON.stringify({ code: 1, data })
  }

  static error(data) {
    return JSON.stringify({ code: 3, data })
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
      let data = {} as any
      try {
        data = JSON.parse(body)
      }
      catch (error) {
        res.write(R.error('请求体解析失败'))
        res.end()
        return
      }
      const { cmd, shell } = data
      if (!cmd) {
        res.write(R.error('缺少指令配置'))
        res.end()
        return
      }
      const str = runCmdGetRes(cmd, shell)
      // 处理请求体
      res.write(R.success(str))
      res.end()
    }
    catch (error) {
      res.write(R.error('未知错误'))
      res.end()
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
