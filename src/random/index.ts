import chalk from 'chalk'

type RandomType = 'int' | 'str' | string

export function random([arg1 = '10', arg2]: string[]) {
  if (arg1 !== 'int' && arg1 !== 'str' && !/^\d+$/.test(arg1)) return console.log(chalk.red('参数错误'))

  const type: RandomType = /int|str/.test(arg1) ? arg1 : 'int' // 默认生成随机整数

  const length = /^\d+$/.test(arg1) ? Number(arg1) : Number(arg2) || 10

  if (type === 'int') {
    // 生成随机整数 第一位不能为0
    const first = Math.floor(Math.random() * 9) + 1
    const rest = Array.from({ length: length - 1 }, () => Math.floor(Math.random() * 10)).join('')
    console.log(chalk.green(first + rest))
  }
  else if (type === 'str') {
    // 生成随机字符串
    const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const result = Array.from({ length }, () => str[Math.floor(Math.random() * str.length)]).join('')
    console.log(chalk.green(result))
  }
}
