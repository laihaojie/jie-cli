import process from 'node:process'
import chalk from 'chalk'
import { runCmdGetRes } from '../utils/run'

export function killPort([port]: any[]) {
  if (!port) {
    console.error(chalk.red('请输入端口号'))
    return
  }
  // 判断port是否为字符串数字
  if (!/^\d+$/.test(port))
    console.error(chalk.red('端口号格式错误'))

  // 判断当前系统
  const isWin = process.platform === 'win32'
  if (isWin) {
    const cmd = `netstat -ano | findstr ${port}`
    console.log(chalk.white(`执行查询命令：${cmd}`), '\n')
    const res = runCmdGetRes(cmd)
    console.log(chalk.green(res), '\n')

    console.log(chalk.red(`端口号：${chalk.bold(`${port}`)}`), '\n')
    if (res && res.includes('TCP')) {
      // 根据换行符分割
      const resArr = res.split(/\r\n|\r|\n/)
      if (resArr.length) {
        // 遍历 找到 PID
        for (let i = 0; i < resArr.length; i++) {
          const item = resArr[i]
          if (new RegExp(`:${port}`).test(item)) {
            const pid = item.split(/\s+/).pop().trim()

            console.log(chalk.red(`进程ID：${chalk.bold(`${pid}`)}`), '\n')

            // 杀死进程
            const cmd = `taskkill /pid ${pid} -f`
            console.log(chalk.white(`执行杀死PID命令：${cmd}`), '\n')
            const res = runCmdGetRes(cmd)
            console.log(chalk.green(res), '\n')
            break
          }
        }
      }
    }
  }
}
