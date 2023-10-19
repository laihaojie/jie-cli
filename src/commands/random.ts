import { randomUUID } from 'node:crypto'
import chalk from 'chalk'
import { copyToClipboard } from '../utils/copy'

type RandomType = 'int' | 'str' | 'uuid' | string

/**
 * 如果第一个参数为int或str，则生成长度为10随机整数或字符串
 * 如果第一个参数为数字，则生成长度为该数字的随机整数
 * 如果第一个参数为uuid，则生成uuid
 * 如果没有参数，则生成10位随机整数
 * 如果第二个参数为数字，则生成长度为该数字的随机整数或字符串 （取决于第一个参数的类型）
 * @returns void
 */
export function random([arg1 = '10', arg2]: string[]) {
  if (
    arg1 !== 'int'
    && arg1 !== 'str'
    && arg1 !== 'uuid'
    && !/^\d+$/.test(arg1)
  ) return console.log(chalk.red('参数错误'))

  const typeReg = /int|str|uuid/

  const type: RandomType = typeReg.test(arg1) ? arg1 : 'int' // 默认生成随机整数

  const length = /^\d+$/.test(arg1) ? Number(arg1) : Number(arg2) || 10

  if (type === 'int') {
    // 生成随机整数 第一位不能为0
    const first = Math.floor(Math.random() * 9) + 1
    const rest = Array.from({ length: length - 1 }, () => Math.floor(Math.random() * 10)).join('')
    copyToClipboard(first + rest)
  }
  else if (type === 'str') {
    // 生成随机字符串
    const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const result = Array.from({ length }, () => str[Math.floor(Math.random() * str.length)]).join('')
    copyToClipboard(result)
  }
  else if (type === 'uuid') {
    // 生成uuid
    const uuid = randomUUID()
    copyToClipboard(uuid)
  }
}
