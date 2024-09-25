/* eslint-disable no-control-regex */
import process from 'node:process'
import chalk from 'chalk'
import { author, homepage, name, version } from '../../package.json'
import { localServer } from '../config'

export function info() {
  const urlObj = new URL(localServer)

  const logList = []
  logList.push({ key: '包名称', value: chalk.green(name) })
  logList.push({ key: 'npm地址', value: chalk.green(`https://www.npmjs.com/package/${name}`) })
  logList.push({ key: '仓库地址', value: chalk.green(homepage) })
  logList.push({ key: 'GitHub', value: chalk.green(`https://github.com/${author}`) })
  logList.push({ key: '版本', value: chalk.green(version) })
  logList.push({ key: '服务端口', value: chalk.green(urlObj.port) })
  logList.push({ key: '当前路径', value: chalk.green(process.cwd()) })

  // 找到最长的key 包含中文 英文 数字 一个中文占两个字符
  let maxKeyLength = 0
  for (const log of logList) {
    const keyLength = log.key.replace(/[^\x00-\xFF]/g, 'aa').length
    if (keyLength > maxKeyLength) {
      maxKeyLength = keyLength
    }
  }
  for (const log of logList) {
    const keyLength = log.key.replace(/[^\x00-\xFF]/g, 'aa').length
    const spaceLength = maxKeyLength - keyLength
    console.log(`${log.key}：${' '.repeat(spaceLength)}${' '.repeat(3)}${log.value}`)
  }
  console.log('')
}
